<?php
// public_html/meta-capi.php
// Surface errors during setup; remove in production.
ini_set('display_errors','1');
ini_set('display_startup_errors','1');
error_reporting(E_ALL);

// Always respond JSON
header('Content-Type: application/json');

// Load config from outside web root using an absolute path built on __DIR__
$cfgPath = __DIR__ . '/../config/meta-capi-config.php';
if (!file_exists($cfgPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'Config not found', 'path' => $cfgPath]);
  exit;
}
require_once $cfgPath; // defines META_PIXEL_ID, META_CAPI_TOKEN, META_INTERNAL_SECRET, META_GRAPH_VERSION

// Enforce POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

// Verify internal secret from header
$providedSecret = $_SERVER['HTTP_X_INTERNAL_SECRET'] ?? '';
if (!hash_equals(META_INTERNAL_SECRET, $providedSecret)) {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

// Parse JSON body strictly
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON', 'detail' => json_last_error_msg()]);
  exit;
}

// Helpers
function hash_sha256($value) {
  if (!isset($value) || $value === '') return null;
  return hash('sha256', strtolower(trim($value)));
}

// Optional: generate a fallback event_id for deduplication if none provided
$eventId = $input['event_id'] ?? bin2hex(random_bytes(8));

// Build event
$event = [
  'event_name'       => $input['event_name'] ?? 'Purchase',
  'event_time'       => time(),
  'action_source'    => 'website',
  'event_source_url' => $input['event_source_url'] ?? '',
  'event_id'         => $eventId,
  'custom_data' => [
    'currency'     => $input['currency'] ?? 'EUR',
    'value'        => isset($input['value']) ? (float)$input['value'] : 0,
    'content_ids'  => [ $input['booking_id'] ?? '' ],
    'contents'     => [[
      'id'         => $input['booking_id'] ?? '',
      'quantity'   => 1,
      'item_price' => isset($input['value']) ? (float)$input['value'] : 0
    ]],
    'content_type' => 'product'
  ],
  'user_data' => [
    'em'                => hash_sha256($input['email'] ?? null),
    'ph'                => isset($input['phone']) ? hash('sha256', preg_replace('/\D+/', '', $input['phone'])) : null,
    'client_ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
    'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
  ],
];

// Remove nulls from user_data to keep payload clean
$event['user_data'] = array_filter($event['user_data'], static fn($v) => $v !== null);

// Build request payload
$request = ['data' => [$event]];
if (!empty($input['test_event_code'])) {
  $request['test_event_code'] = $input['test_event_code'];
}
$payload = json_encode($request, JSON_UNESCAPED_SLASHES);

// Send to Meta Conversions API
$version = defined('META_GRAPH_VERSION') ? META_GRAPH_VERSION : 'v18.0';
$url = "https://graph.facebook.com/{$version}/" . META_PIXEL_ID . "/events?access_token=" . urlencode(META_CAPI_TOKEN);

$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_POST           => true,
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS     => $payload,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CONNECTTIMEOUT => 10,
  CURLOPT_TIMEOUT        => 20,
  CURLOPT_SSL_VERIFYPEER => true,
  CURLOPT_SSL_VERIFYHOST => 2,
]);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
  $err = curl_error($ch);
  curl_close($ch);
  http_response_code(500);
  echo json_encode(['error' => 'cURL failure', 'detail' => $err]);
  exit;
}

curl_close($ch);

// Pass-through Meta response and HTTP code
http_response_code($httpcode ?: 500);
echo $response;

