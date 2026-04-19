<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

$result = $conn->query("SELECT * FROM customers ORDER BY name ASC");

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex flex-col gap-4 sticky top-0 z-30">
    <div class="flex items-center justify-between">
        <a href="index.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
            <i data-lucide="arrow-left"></i>
        </a>
        <h1 class="text-lg font-bold text-gray-800">Clientes</h1>
        <div class="w-10"></div>
    </div>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar pb-24">
    <?php while($row = $result->fetch_assoc()): ?>
        <div class="bg-white border border-gray-100 p-4 rounded-3xl flex items-center justify-between group hover:shadow-md transition-all">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden ring-2 ring-gray-50">
                    <img src="https://picsum.photos/seed/<?php echo urlencode($row['name']); ?>/100/100" class="w-full h-full object-cover">
                </div>
                <div>
                    <h4 class="font-bold text-sm text-gray-800"><?php echo htmlspecialchars($row['name']); ?></h4>
                    <p class="text-xs text-gray-500 font-medium"><?php echo htmlspecialchars($row['contact']); ?></p>
                </div>
            </div>
            <a href="detalhes_cliente.php?id=<?php echo $row['id']; ?>" class="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all">
                <i data-lucide="chevron-right" size="20"></i>
            </a>
        </div>
    <?php endwhile; ?>
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
    <a href="clientes.php" class="flex flex-col items-center gap-1 text-blue-600 font-bold">
        <i data-lucide="user"></i>
        <span class="text-[10px]">Clientes</span>
    </a>
    <a href="equipa.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500">
        <i data-lucide="layout-grid"></i>
        <span class="text-[10px]">Mais</span>
    </a>
</nav>

<?php include 'inc/footer.php'; ?>
