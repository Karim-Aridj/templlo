<?php
// meta-capi.php
// Replace with your real Pixel ID and secure, server-only access token.
$pixel_id = '809554794870202';
$access_token = 'YOUR_LONG_LIVED_ACCESS_TOKEN';

// Read JSON from POST
$input = json_decode(file_get_contents('php://input'), true);

// Helper: SHA-256 hash normalization for user_data
function hash_sha256($value) {
  if (!isset($value) || $value === '') return null;
  $norm = strtolower(trim($value));
  return hash('sha256', $norm);
}

// Build event payload
$event = [
  'event_name' => $input['event_name'] ?? 'Purchase',
  'event_time' => time(),
  'action_source' => 'website',
  'event_source_url' => $input['event_source_url'] ?? '',
  'event_id' => $input['event_id'] ?? '',

  'custom_data' => [
    'currency' => $input['currency'] ?? 'EUR',
    'value' => isset($input['value']) ? (float)$input['value'] : 0,
    'content_ids' => [ $input['booking_id'] ?? '' ],
    'contents' => [[
      'id' => $input['booking_id'] ?? '',
      'quantity' => 1,
      'item_price' => isset($input['value']) ? (float)$input['value'] : 0
    ]],
    'content_type' => 'product'
  ],

  'user_data' => [
    'em' => hash_sha256($input['email'] ?? null),
    'ph' => isset($input['phone']) ? hash('sha256', preg_replace('/\D+/', '', $input['phone'])) : null,
    'client_ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
    'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
  ],
];

$payload = json_encode(['data' => [$event]]);

// Send to Meta CAPI
$ch = curl_init("https://graph.facebook.com/v18.0/{$pixel_id}/events?access_token={$access_token}");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_RETURNTRANSFER => true
]);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Respond to caller
http_response_code($httpcode);
header('Content-Type: application/json');
echo $response;

