<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

$id = $_GET['id'] ?? '';
$stmt = $conn->prepare("SELECT * FROM appointments WHERE id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$appt = $stmt->get_result()->fetch_assoc();

if (!$appt) {
    header("Location: agendamentos.php");
    exit;
}

// Lógica de atualização de status
if (isset($_POST['update_status'])) {
    $new_status = $_POST['status'];
    $stmt_up = $conn->prepare("UPDATE appointments SET status = ? WHERE id = ?");
    $stmt_up->bind_param("ss", $new_status, $id);
    $stmt_up->execute();
    header("Location: detalhes_agendamento.php?id=$id");
    exit;
}

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
    <a href="agendamentos.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
        <i data-lucide="arrow-left"></i>
    </a>
    <h1 class="text-lg font-bold text-gray-800">Detalhes do Serviço</h1>
    <div class="w-10"></div>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-24">
    <!-- Card Cliente -->
    <div class="bg-blue-600 p-6 rounded-4xl text-white space-y-4 shadow-xl shadow-blue-200">
        <div class="flex justify-between items-start">
            <div class="space-y-1">
                <p class="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Cliente</p>
                <h2 class="text-xl font-bold"><?php echo htmlspecialchars($appt['customerName']); ?></h2>
            </div>
            <div class="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                <?php echo $appt['status']; ?>
            </div>
        </div>
        
        <div class="space-y-3 pt-2">
            <div class="flex items-center gap-3 text-sm">
                <div class="p-2 bg-white/20 rounded-xl">
                    <i data-lucide="map-pin" size="16"></i>
                </div>
                <p class="font-medium opacity-90"><?php echo htmlspecialchars($appt['address']); ?></p>
            </div>
            <div class="flex items-center gap-3 text-sm">
                <div class="p-2 bg-white/20 rounded-xl">
                    <i data-lucide="clock" size="16"></i>
                </div>
                <p class="font-medium opacity-90"><?php echo date('d/m/Y', strtotime($appt['date'])); ?> às <?php echo substr($appt['startTime'], 0, 5); ?></p>
            </div>
        </div>
    </div>

    <!-- Ações Rápidas -->
    <div class="grid grid-cols-2 gap-3">
        <form method="POST" class="w-full">
            <input type="hidden" name="update_status" value="1">
            <input type="hidden" name="status" value="A Caminho">
            <button class="w-full py-4 bg-orange-50 text-orange-600 rounded-3xl font-bold text-xs uppercase flex flex-col items-center gap-2 border border-orange-100">
                <i data-lucide="play" size="20"></i>
                A Caminho
            </button>
        </form>
        <form method="POST" class="w-full">
            <input type="hidden" name="update_status" value="1">
            <input type="hidden" name="status" value="Concluído">
            <button class="w-full py-4 bg-green-50 text-green-600 rounded-3xl font-bold text-xs uppercase flex flex-col items-center gap-2 border border-green-100">
                <i data-lucide="check" size="20"></i>
                Concluir
            </button>
        </form>
    </div>

    <!-- Comentários -->
    <?php if ($appt['comment']): ?>
        <section class="space-y-2">
            <h3 class="font-bold text-gray-400 text-[10px] uppercase tracking-widest ml-1">Observações</h3>
            <div class="bg-gray-50 p-4 rounded-3xl border border-gray-100 text-sm text-gray-600 italic">
                "<?php echo htmlspecialchars($appt['comment']); ?>"
            </div>
        </section>
    <?php endif; ?>

    <!-- Seção de Checklist (Frontend apenas nesta versão) -->
    <section class="space-y-4">
        <h3 class="font-bold text-gray-400 text-[10px] uppercase tracking-widest ml-1">Tarefas de Limpeza</h3>
        <div class="space-y-2">
            <?php 
                $tasks = ["Cozinha", "Casas de Banho", "Quartos", "Aspirar", "Mudar Lençóis"];
                foreach($tasks as $t): 
            ?>
                <label class="flex items-center gap-4 p-4 bg-white border border-gray-50 rounded-3xl cursor-pointer active:scale-[0.98] transition-all">
                    <input type="checkbox" class="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-500">
                    <span class="text-sm font-medium text-gray-700"><?php echo $t; ?></span>
                </label>
            <?php endforeach; ?>
        </div>
    </section>
</main>

<?php include 'inc/footer.php'; ?>
