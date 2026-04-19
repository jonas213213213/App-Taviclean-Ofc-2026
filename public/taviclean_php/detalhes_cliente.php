<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

$id = $_GET['id'] ?? '';
$stmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$customer = $stmt->get_result()->fetch_assoc();

if (!$customer) {
    header("Location: clientes.php");
    exit;
}

// Buscar histórico de serviços do cliente
$history = $conn->query("SELECT * FROM appointments WHERE customer_id = '$id' ORDER BY date DESC");

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
    <a href="clientes.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
        <i data-lucide="arrow-left"></i>
    </a>
    <h1 class="text-lg font-bold text-gray-800">Perfil do Cliente</h1>
    <div class="w-10"></div>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar pb-24">
    <!-- Header Perfil -->
    <section class="text-center space-y-4">
        <div class="w-24 h-24 rounded-4xl bg-gray-100 mx-auto overflow-hidden shadow-xl ring-8 ring-blue-50">
            <img src="https://picsum.photos/seed/<?php echo urlencode($customer['name']); ?>/200/200" class="w-full h-full object-cover">
        </div>
        <div>
            <h2 class="text-xl font-bold text-gray-800"><?php echo htmlspecialchars($customer['name']); ?></h2>
            <p class="text-gray-400 text-sm font-medium"><?php echo htmlspecialchars($customer['district']); ?></p>
        </div>
    </section>

    <!-- Infos -->
    <section class="grid grid-cols-2 gap-4">
        <div class="bg-white border border-gray-100 p-4 rounded-3xl space-y-1">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contacto</p>
            <p class="text-sm font-bold text-gray-700"><?php echo htmlspecialchars($customer['contact']); ?></p>
        </div>
        <div class="bg-white border border-gray-100 p-4 rounded-3xl space-y-1">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
            <p class="text-[10px] font-bold text-gray-700 truncate"><?php echo htmlspecialchars($customer['email']); ?></p>
        </div>
    </section>

    <div class="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 space-y-1">
        <p class="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Morada de Limpeza</p>
        <p class="text-sm font-bold text-blue-900 leading-relaxed"><?php echo htmlspecialchars($customer['address']); ?></p>
    </div>

    <!-- Histórico -->
    <section class="space-y-4">
        <h3 class="font-bold text-gray-400 text-xs uppercase tracking-widest ml-1">Histórico de Serviços</h3>
        <div class="space-y-3">
            <?php if ($history->num_rows > 0): ?>
                <?php while($row = $history->fetch_assoc()): ?>
                    <div class="bg-white border border-gray-100 p-4 rounded-3xl flex justify-between items-center group">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-500">
                                <i data-lucide="check-circle-2" size="20"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm"><?php echo htmlspecialchars($row['serviceType']); ?></h4>
                                <p class="text-[10px] text-gray-400 font-bold uppercase"><?php echo date('d/m/Y', strtotime($row['date'])); ?></p>
                            </div>
                        </div>
                        <p class="font-bold text-blue-600 text-sm"><?php echo number_format($row['price'], 2); ?>€</p>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <p class="text-center py-6 text-gray-400 text-sm">Nenhum serviço anterior.</p>
            <?php endif; ?>
        </div>
    </section>
</main>

<?php include 'inc/footer.php'; ?>
