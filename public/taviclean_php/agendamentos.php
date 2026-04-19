<?php
require_once 'config.php';
check_auth();

$conn = get_db_connection();

// Filtragem
$status_filter = $_GET['status'] ?? 'Todos';
$search = $_GET['q'] ?? '';

$sql = "SELECT * FROM appointments";
$where = [];
if ($status_filter !== 'Todos') {
    $where[] = "status = '$status_filter'";
}
if ($search) {
    $where[] = "(customerName LIKE '%$search%' OR address LIKE '%$search%')";
}

if (count($where) > 0) {
    $sql .= " WHERE " . implode(" AND ", $where);
}
$sql .= " ORDER BY date DESC, startTime ASC";

$result = $conn->query($sql);

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex flex-col gap-4 sticky top-0 z-30">
    <div class="flex items-center justify-between">
        <a href="index.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
            <i data-lucide="arrow-left"></i>
        </a>
        <h1 class="text-lg font-bold text-gray-800">Minha Agenda</h1>
        <div class="w-10"></div>
    </div>

    <!-- Search & Filter -->
    <div class="flex gap-2">
        <div class="flex-1 relative">
            <i data-lucide="search" size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <form action="" method="GET">
                <input type="text" name="q" value="<?php echo htmlspecialchars($search); ?>"
                    class="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:bg-white border border-transparent focus:border-blue-100"
                    placeholder="Pesquisar...">
            </form>
        </div>
        <button class="p-3 bg-gray-50 rounded-xl text-gray-500">
            <i data-lucide="filter" size="18"></i>
        </button>
    </div>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-24">
    <?php while($row = $result->fetch_assoc()): ?>
        <a href="detalhes_agendamento.php?id=<?php echo $row['id']; ?>" class="block bg-white border border-gray-100 p-4 rounded-3xl space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        <img src="https://picsum.photos/seed/<?php echo urlencode($row['customerName']); ?>/100/100" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-gray-800"><?php echo htmlspecialchars($row['customerName']); ?></h4>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"><?php echo $row['serviceType']; ?></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase tracking-tighter">
                        <?php echo $row['status']; ?>
                    </span>
                    <p class="text-[10px] text-gray-400 mt-1"><?php echo date('d M', strtotime($row['date'])); ?></p>
                </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-50">
                <div class="flex items-center gap-4 text-xs text-gray-500">
                    <div class="flex items-center gap-1">
                        <i data-lucide="clock" size="12" class="text-blue-500"></i>
                        <?php echo substr($row['startTime'], 0, 5); ?>
                    </div>
                    <div class="flex items-center gap-1">
                        <i data-lucide="map-pin" size="12" class="text-red-500"></i>
                        <?php echo htmlspecialchars($row['city'] ? $row['city'] : 'Faro'); ?>
                    </div>
                </div>
                <p class="font-bold text-blue-600 text-sm"><?php echo number_format($row['price'], 2); ?>€</p>
            </div>
        </a>
    <?php endwhile; ?>
</main>

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 h-20 flex items-center justify-around px-2 z-40">
    <a href="index.php" class="flex flex-col items-center gap-1 text-gray-400">
        <i data-lucide="layout-dashboard"></i>
        <span class="text-[10px]">Painel</span>
    </a>
    <a href="agendamentos.php" class="flex flex-col items-center gap-1 text-blue-600 font-bold">
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
