
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title inertia>MePesewa - Personal Finance</title>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    <x-inertia::head />
</head>
<body class="font-sans antialiased bg-gray-50 text-gray-900">
    <x-inertia::app />
</body>
</html>
