
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'hello world';
});

Route::get('/ping', function () {
    return response('PONG_FROM_LARAVEL', 200);
});

Route::get('/diagnostic', function () {
    try {
        return response()->json([
            'laravel' => app()->version(),
            'php' => PHP_VERSION,
            'environment' => app()->environment(),
            'base_path' => base_path(),
            'routes_loaded' => true,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
        ], 500);
    }
});
