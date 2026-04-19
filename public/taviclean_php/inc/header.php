<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaviClean - Gestão de Limpezas</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3182CE',
                        success: '#48BB78',
                        pending: '#ED8936',
                        completed: '#38A169',
                        'bg-app': '#F7FAFC',
                        'text-main': '#1A202C',
                        'text-sub': '#718096',
                    },
                    borderRadius: {
                        '3xl': '24px',
                        '4xl': '32px',
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #F7FAFC; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-gray-50 flex justify-center">
    <div class="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col overflow-hidden">
