<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - Jobsy</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        
        <!-- Icônes en fonction du résultat -->
        @if($type === 'success')
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                ✓
            </div>
        @elseif($type === 'decline' || $type === 'info')
            <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                ℹ
            </div>
        @else
            <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                ✕
            </div>
        @endif

        <h1 class="text-2xl font-bold text-slate-800 mb-2">{{ $title }}</h1>
        <p class="text-slate-600 text-sm leading-relaxed mb-6">{{ $message }}</p>

        @if(isset($proposal))
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6">
                <p class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Mission</p>
                <p class="font-semibold text-slate-800 text-sm mb-1">{{ $proposal->mission->title ?? 'N/A' }}</p>
                <p class="text-xs text-slate-500">{{ $proposal->entreprise->nom_entreprise ?? $proposal->entreprise->name ?? 'Entreprise' }}</p>
            </div>
        @endif

        @if(isset($confirmAction))
            {{-- Confirmation explicite : les antivirus et filtres de messagerie ouvrent les liens des emails (GET) ;
                 seul ce clic (POST protégé par CSRF) enregistre la réponse du candidat. --}}
            <form method="POST" action="{{ $confirmAction }}" class="mb-4">
                @csrf
                <button type="submit" class="w-full {{ $type === 'decline' ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700' }} text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
                    {{ $confirmLabel }}
                </button>
            </form>
        @endif

        <div class="pt-2">
            <a href="{{ frontendUrl() }}" class="inline-block bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-colors">
                Retourner sur Jobsy
            </a>
        </div>
    </div>
</body>
</html>