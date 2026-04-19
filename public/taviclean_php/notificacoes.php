<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

// Marcar todas como lidas se solicitado
if (isset($_POST['mark_read'])) {
    $conn->query("UPDATE notifications SET unread = 0");
}

$notifications = $conn->query("SELECT * FROM notifications ORDER BY time DESC LIMIT 50");

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
    <a href="index.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
        <i data-lucide="arrow-left"></i>
    </a>
    <h1 class="text-lg font-bold text-gray-800">Notificações</h1>
    <form method="POST">
        <button type="submit" name="mark_read" class="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
            <i data-lucide="check-check"></i>
        </button>
    </form>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-24">
    <?php if ($notifications->num_rows > 0): ?>
        <?php while($n = $notifications->fetch_assoc()): ?>
            <div class="bg-white border <?php echo $n['unread'] ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'; ?> p-4 rounded-3xl flex gap-4 relative">
                <div class="w-10 h-10 rounded-2xl <?php echo $n['unread'] ? 'bg-blue-500' : 'bg-gray-100'; ?> flex items-center justify-center text-white shrink-0">
                    <i data-lucide="bell" size="18" class="<?php echo $n['unread'] ? 'text-white' : 'text-gray-400'; ?>"></i>
                </div>
                <div class="flex-1 space-y-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-sm <?php echo $n['unread'] ? 'text-blue-900' : 'text-gray-800'; ?>">
                            <?php echo htmlspecialchars($n['title']); ?>
                        </h4>
                        <span class="text-[9px] text-gray-400 font-bold uppercase"><?php echo date('H:i', strtotime($n['time'])); ?></span>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed">
                        <?php echo htmlspecialchars($n['message']); ?>
                    </p>
                </div>
                <?php if ($n['unread']): ?>
                    <span class="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></span>
                <?php endif; ?>
            </div>
        <?php endwhile; ?>
    <?php else: ?>
        <div class="text-center py-20 text-gray-400 opacity-30">
            <i data-lucide="bell-off" size="48" class="mx-auto mb-4"></i>
            <p>Nada por aqui ainda.</p>
        </div>
    <?php endif; ?>
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
