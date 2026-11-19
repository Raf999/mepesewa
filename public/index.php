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

ob_start();

try {
    $kernel = $app->make(
        \Illuminate\Contracts\Http\Kernel::class
    );

    $request = Request::capture();

    $response = $kernel->handle($request);

    $debugOutput = ob_get_clean();

    echo "KERNEL_HANDLE_RETURNED\n";
    echo "HTTP_STATUS: " . $response->getStatusCode() . "\n";
    echo "DEBUG_OUTPUT:\n" . $debugOutput;
    echo "RESPONSE_BODY:\n";
    echo $response->getContent();

    $kernel->terminate($request, $response);

} catch (\Throwable $e) {
    if (ob_get_level() > 0) {
        ob_end_clean();
    }

    echo "EXCEPTION: " . get_class($e) . "\n";
    echo "MESSAGE: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . "\n";
    echo "LINE: " . $e->getLine() . "\n";
}
