<?php
// public_html/meta-capi.php
ini_set('display_errors','1');
ini_set('display_startup_errors','1');
error_reporting(E_ALL);
require __DIR__ . '/../config/meta-capi-config.php'; // uses META_PIXEL_ID, META_CAPI_TOKEN, META_INTERNAL_SECRET

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  exit('Method Not Allowed');
}

if (!hash_equals(META_INTERNAL_SECRET, $_SERVER['HTTP_X_INTERNAL_SECRET'] ?? '')) {
  http_response_code(403);
  exit('Forbidden');
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

function hash_sha256($value) {
  if (!isset($value) || $value === '') return null;
  return hash('sha256', strtolower(trim($value)));
}

$event = [
  'event_name'       => $input['event_name'] ?? 'Purchase',
  'event_time'       => time(),
  'action_source'    => 'website',
  'event_source_url' => $input['event_source_url'] ?? '',
  'event_id'         => $input['event_id'] ?? '',
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

$request = ['data' => [$event]];
if (!empty($input['test_event_code'])) {
  $request['test_event_code'] = $input['test_event_code'];
}
$payload = json_encode($request);

$ch = curl_init(
  "https://graph.facebook.com/v18.0/" . META_PIXEL_ID . "/events?access_token=" . urlencode(META_CAPI_TOKEN)
);
curl_setopt_array($ch, [
  CURLOPT_POST           => true,
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS     => $payload,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 20
]);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($response === false) {
  $err = curl_error($ch);
  curl_close($ch);
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => $err]);
  exit;
}
curl_close($ch);

http_response_code($httpcode);
header('Content-Type: application/json');
echo $response;

