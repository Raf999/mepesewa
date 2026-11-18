<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'hello world';
});

Route::get('/ping', fn () => 'pong');
