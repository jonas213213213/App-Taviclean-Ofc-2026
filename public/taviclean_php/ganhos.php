<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

// Buscar ganhos totais por mês
$stats = $conn->query("SELECT SUM(price) as total FROM appointments WHERE status = 'Concluído'");
$total_ganho = $stats->fetch_assoc()['total'] ?? 0;

// Lista de transações (serviços concluídos)
$transactions = $conn->query("SELECT * FROM appointments WHERE status = 'Concluído' ORDER BY date DESC");

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
    <a href="equipa.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
        <i data-lucide="arrow-left"></i>
    </a>
    <h1 class="text-lg font-bold text-gray-800">Meus Ganhos</h1>
    <div class="w-10"></div>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar pb-24">
    <!-- Card de Saldo -->
    <section class="bg-white border-2 border-blue-500 p-8 rounded-[40px] text-center space-y-4 shadow-2xl shadow-blue-100 relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest relative z-10">Total Acumulado</<?php echo date('Y'); ?>p>
        <h2 class="text-4xl font-black text-gray-800 relative z-10"><?php echo number_format($total_ganho, 2); ?>€</h2>
        <div class="flex justify-center gap-2 relative z-10">
            <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase">+12% este mês</span>
        </div>
    </section>

    <!-- Transações -->
    <section class="space-y-4">
        <div class="flex justify-between items-center px-1">
            <h3 class="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Histórico de Pagamentos</h3>
            <i data-lucide="info" size="14" class="text-gray-300"></i>
        </div>

        <div class="space-y-3">
            <?php if ($transactions->num_rows > 0): ?>
                <?php while($row = $transactions->fetch_assoc()): ?>
                    <div class="bg-white border border-gray-100 p-4 rounded-3xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                <i data-lucide="wallet" size="24"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-gray-800"><?php echo htmlspecialchars($row['customerName']); ?></h4>
                                <p class="text-[10px] text-gray-400 font-bold uppercase"><?php echo date('d M Y', strtotime($row['date'])); ?></p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-blue-600 text-sm">+<?php echo number_format($row['price'], 2); ?>€</p>
                            <p class="text-[9px] text-green-500 font-bold uppercase">Pago</p>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="text-center py-10 opacity-30">
                    <i data-lucide="history" size="32" class="mx-auto mb-2 text-gray-400"></i>
                    <p class="text-xs">Nenhum ganho registado ainda.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 h-20 flex items-center justify-around px-2 z-40">
    <a href="index.php" class="flex flex-col items-center gap-1 text-gray-400">
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
