<?php
header('Content-Type: application/json');

// ВАЖНО: Вставьте ваши реальные данные в кавычки вместо текста заглушек
$TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
$TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

// Получаем JSON данные из тела POST-запроса
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No data received']);
    exit;
}

// Получаем и очищаем данные формы
$lang = isset($data['lang']) ? htmlspecialchars($data['lang']) : 'Unknown';
$name = isset($data['name']) ? htmlspecialchars($data['name']) : 'Не указано';
$contact = isset($data['contact']) ? htmlspecialchars($data['contact']) : 'Не указано';
$message = isset($data['message']) ? htmlspecialchars($data['message']) : '';

// Формируем текст сообщения для Telegram
$text = "
🎯 <b>Новая заявка с сайта OSTROV !</b>
🌍 Язык: {$lang}
👤 Имя: {$name}
📞 Контакт: {$contact}

💬 <b>Сообщение:</b>
{$message}
";

// Обращение к Telegram API
$url = "https://api.telegram.org/bot{$TELEGRAM_BOT_TOKEN}/sendMessage";

$postFields = [
    'chat_id' => $TELEGRAM_CHAT_ID,
    'text' => trim($text),
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Не забудьте раскомментировать эту строку, если ваш хостинг блокирует SSL сертификаты Telegram!
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode == 200) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Telegram API error', 'http_code' => $httpCode, 'response' => $response, 'curl_error' => $curlError]);
}
?>
