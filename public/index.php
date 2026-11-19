
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(
    \Illuminate\Contracts\Http\Kernel::class
);

$request = Request::capture();

$response = $kernel->handle($request);

error_log('MEPESEWA RESPONSE DIAGNOSTICS: ' . json_encode([
    'status' => $response->getStatusCode(),
    'content_length' => strlen($response->getContent()),
    'headers' => $response->headers->all(),
    'headers_sent' => headers_sent(),
    'output_buffer_level' => ob_get_level(),
    'output_buffering' => ini_get('output_buffering'),
]));

$response->sendContent();

$kernel->terminate($request, $response);
