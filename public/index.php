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

$sentFile = null;
$sentLine = null;

error_log('MEPESEWA HEADER CHECK: ' . json_encode([
    'headers_sent' => headers_sent($sentFile, $sentLine),
    'sent_file' => $sentFile,
    'sent_line' => $sentLine,
    'status' => $response->getStatusCode(),
    'body' => $response->getContent(),
]));

$response->send();

$kernel->terminate($request, $response);