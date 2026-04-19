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
<header class="bg-white h-20 flex items-end justify-between px-5 pb-4 border-b border-slate-100 z-30 shrink-0">
    <button onclick="toggleMenu()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
        <i data-lucide="menu"></i>
    </button>
    <div class="flex flex-col items-center">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TaviClean</span>
        <h1 class="text-lg font-bold text-slate-800 tracking-tight">Painel Principal</h1>
    </div>
    <a href="notificacoes.php" class="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
        <i data-lucide="bell"></i>
        <?php if ($count_pending > 0): ?>
            <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        <?php endif; ?>
    </a>
</header>

<main class="flex-1 overflow-y-auto pb-24 space-y-4 no-scrollbar">
    <!-- Quick Stats Grid (React style) -->
    <div class="p-4 grid grid-cols-3 gap-3">
        <div class="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">HOJE</span>
            <span class="text-2xl font-extrabold text-primary"><?php echo $count_today; ?></span>
            <span class="text-[8px] font-bold text-slate-400 mt-1 uppercase">SERVIÇOS</span>
        </div>
        <div class="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PENDENTES</span>
            <span class="text-2xl font-extrabold text-warning"><?php echo $count_pending; ?></span>
            <span class="text-[8px] font-bold text-slate-400 mt-1 uppercase">LIMITES</span>
        </div>
        <div class="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RATING</span>
            <span class="text-2xl font-extrabold text-success">5.0</span>
            <span class="text-[8px] font-bold text-slate-400 mt-1 uppercase">MÉDIA</span>
        </div>
    </div>

    <!-- Category Tabs Filter -->
    <div class="px-4">
        <div class="bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100 flex gap-1">
            <button class="flex-1 py-3 rounded-[16px] text-xs font-bold bg-primary text-white shadow-md shadow-primary/20 transition-all">
                Agenda
            </button>
            <button class="flex-1 py-3 rounded-[16px] text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                Histórico
            </button>
            <button class="flex-1 py-3 rounded-[16px] text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                Ganhos
            </button>
        </div>
    </div>

    <!-- Today's List -->
    <section class="p-4 space-y-4">
        <div class="flex justify-between items-center px-2">
            <div class="flex items-center gap-2">
                <i data-lucide="clock" size="14" class="text-primary"></i>
                <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Serviços de Hoje</h3>
            </div>
            <span class="text-[10px] font-bold text-primary uppercase"><?php echo $appts->num_rows; ?> totais</span>
        </div>

        <div class="space-y-3">
            <?php if ($appts->num_rows > 0): ?>
                <?php while($row = $appts->fetch_assoc()): ?>
                    <a href="detalhes_agendamento.php?id=<?php echo $row['id']; ?>" class="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer">
                        <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                            <img src="https://picsum.photos/seed/<?php echo urlencode($row['customerName']); ?>/100/100" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1">
                            <h4 class="font-extrabold text-sm text-slate-800 tracking-tight"><?php echo htmlspecialchars($row['customerName']); ?></h4>
                            <div class="flex items-center gap-2 mt-0.5">
                                <p class="text-[10px] font-bold text-primary uppercase tracking-widest"><?php echo htmlspecialchars($row['serviceType'] ?? 'Limpeza'); ?></p>
                                <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-bold uppercase">
                                    <?php echo $row['status']; ?>
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-slate-800 tracking-tight"><?php echo substr($row['startTime'], 0, 5); ?></p>
                            <div class="flex items-center gap-1 justify-end text-slate-300">
                                <i data-lucide="chevron-right" size="14"></i>
                            </div>
                        </div>
                    </a>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="bg-white p-10 rounded-[32px] border border-slate-100 text-center space-y-3 shadow-sm">
                    <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <i data-lucide="calendar" size="28"></i>
                    </div>
                    <p class="text-xs font-bold text-slate-400">Nenhum serviço para hoje.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<!-- Floating Action Button (FAB) -->
<a href="agendar.php" class="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-90 transition-all z-50">
    <i data-lucide="plus" size="32"></i>
</a>

<?php include 'inc/footer.php'; ?>
