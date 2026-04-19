<?php
require_once 'config.php';

// Se não estiver logado, redirecionar para Login
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

$conn = get_db_connection();
$user_name = $_SESSION['admin_name'];

// Buscar estatísticas rápidas
$today = date('Y-m-d');
$res_today = $conn->query("SELECT COUNT(*) as total FROM appointments WHERE date = '$today'");
$count_today = $res_today->fetch_assoc()['total'];

$res_pending = $conn->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'Pendente'");
$count_pending = $res_pending->fetch_assoc()['total'];

// Buscar agendamentos de hoje
$appts = $conn->query("SELECT * FROM appointments WHERE date = '$today' ORDER BY startTime ASC");

include 'inc/header.php';
?>

<!-- Home/Dashboard View -->
<header class="bg-white h-20 flex items-end justify-between px-5 pb-4 border-b border-gray-100 shrink-0">
    <button class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
        <i data-lucide="menu"></i>
    </button>
    <div class="flex flex-col items-center">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TaviClean</span>
        <h1 class="text-lg font-bold text-gray-800">Painel Principal</h1>
    </div>
    <a href="notificacoes.php" class="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full">
        <i data-lucide="bell"></i>
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
    </a>
</header>

<main class="flex-1 overflow-y-auto pb-24 p-5 space-y-6 no-scrollbar">
    <!-- Welcome Section -->
    <div class="space-y-1">
        <p class="text-sm text-gray-500">Olá, <?php echo $user_name; ?> 👋</p>
        <h2 class="text-2xl font-bold">Resumo de Hoje</h2>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 p-4 rounded-3xl border border-blue-100">
            <div class="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-200">
                <i data-lucide="calendar" size="20"></i>
            </div>
            <p class="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Para Hoje</p>
            <p class="text-2xl font-bold text-blue-800"><?php echo $count_today; ?></p>
        </div>
        <div class="bg-orange-50 p-4 rounded-3xl border border-orange-100">
            <div class="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-orange-200">
                <i data-lucide="clock" size="20"></i>
            </div>
            <p class="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Pendentes</p>
            <p class="text-2xl font-bold text-orange-800"><?php echo $count_pending; ?></p>
        </div>
    </div>

    <!-- Today's List -->
    <section class="space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg">Serviços de Hoje</h3>
            <a href="agendar.php" class="p-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-200">
                <i data-lucide="plus" size="18"></i>
            </a>
        </div>

        <div class="space-y-3">
            <?php if ($appts->num_rows > 0): ?>
                <?php while($row = $appts->fetch_assoc()): ?>
                    <a href="detalhes_agendamento.php?id=<?php echo $row['id']; ?>" class="bg-white border border-gray-100 p-4 rounded-3xl flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src="https://picsum.photos/seed/<?php echo urlencode($row['customerName']); ?>/100/100" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-sm"><?php echo htmlspecialchars($row['customerName']); ?></h4>
                            <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <i data-lucide="map-pin" size="10"></i> <?php echo htmlspecialchars($row['address']); ?>
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-blue-600"><?php echo substr($row['startTime'], 0, 5); ?></p>
                            <span class="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase mt-1 inline-block">
                                <?php echo $row['status']; ?>
                            </span>
                        </div>
                    </div></a>
<?php endwhile; ?>
            <?php else: ?>
                <div class="text-center py-10 text-gray-400">
                    <i data-lucide="sparkles" size="32" class="mx-auto mb-2 opacity-20"></i>
                    <p class="text-sm">Sem serviços agendados para hoje.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 h-20 flex items-center justify-around px-2 z-40">
    <a href="index.php" class="flex flex-col items-center gap-1 text-blue-600 font-bold">
        <i data-lucide="layout-dashboard"></i>
        <span class="text-[10px]">Painel</span>
    </a>
    <a href="agendamentos.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500">
        <i data-lucide="calendar"></i>
        <span class="text-[10px]">Agenda</span>
    </a>
    <a href="clientes.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500">
        <i data-lucide="user"></i>
        <span class="text-[10px]">Clientes</span>
    </a>
    <a href="equipa.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500">
        <i data-lucide="layout-grid"></i>
        <span class="text-[10px]">Mais</span>
    </a>
</nav>

<?php include 'inc/footer.php'; ?>
