
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'hello world';
});

Route::get('/ping', function () {
    return response('PONG_FROM_LARAVEL', 200);
});

Route::get('/diagnostic', function () {
    return response()->json([
        'laravel' => app()->version(),
        'environment' => app()->environment(),
        'base_path' => base_path(),
        'status' => 'working',
    ]);
});
