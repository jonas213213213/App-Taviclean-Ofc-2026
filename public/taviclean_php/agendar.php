<?php
require_once 'config.php';
// check_auth();

$date_pre = $_GET['date'] ?? date('Y-m-d');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = get_db_connection();
    
    $id = uniqid();
    $name = trim($_POST['name'] ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $district = trim($_POST['district'] ?? '');
    $serviceType = $_POST['serviceType'] ?? 'Limpeza Padrão';
    $date = $_POST['date'] ?? date('Y-m-d');
    $time = $_POST['time'] ?? '09:00';
    $price = $_POST['price'] ?? 0;
    $comment = $_POST['comment'] ?? '';

    // Guardar ou atualizar cliente
    $cust_id = 'c_' . substr(md5($email), 0, 8);
    $stmt_cust = $conn->prepare("INSERT INTO customers (id, name, contact, email, address, district, municipality) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE name=VALUES(name), contact=VALUES(contact), address=VALUES(address)");
    $stmt_cust->bind_param("sssssss", $cust_id, $name, $contact, $email, $address, $district, $district);
    $stmt_cust->execute();

    // Guardar agendamento
    $stmt_appt = $conn->prepare("INSERT INTO appointments (id, date, startTime, customer_id, customerName, serviceType, address, city, price, comment, status) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')");
    $stmt_appt->bind_param("ssssssssds", $id, $date, $time, $cust_id, $name, $serviceType, $address, $district, $price, $comment);
    
    if ($stmt_appt->execute()) {
        set_flash_message("Sucesso! Serviço agendado para $name.");
        write_log("Novo agendamento criado: $name em $date às $time", "info");
        header("Location: agendamentos.php");
        exit;
    } else {
        set_flash_message("Erro ao agendar: " . $conn->error, "error");
        write_log("Erro ao criar agendamento: " . $conn->error, "error");
    }
}

// Inteligência de Horários: Buscar ocupação do dia
$conn = get_db_connection();
$occupied = $conn->query("SELECT startTime FROM appointments WHERE date = '$date_pre'");
$occupied_slots = [];
while($occ = $occupied->fetch_assoc()) {
    $occupied_slots[] = substr($occ['startTime'], 0, 5);
}

include 'inc/header.php';
?>

<header class="bg-white h-20 flex items-center justify-between px-5 border-b border-gray-100 sticky top-0 z-30">
    <div class="flex items-center gap-1">
        <button onclick="toggleMenu()" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <i data-lucide="menu"></i>
        </button>
        <a href="index.php" class="p-2 text-gray-600 hover:bg-gray-50 rounded-full">
            <i data-lucide="arrow-left"></i>
        </a>
    </div>
    <h1 class="text-lg font-bold text-gray-800">Novo Agendamento</h1>
    <div class="w-10"></div>
</header>

<main class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24">
    <!-- Slot Intelligence -->
    <div class="bg-blue-50 p-4 rounded-3xl border border-blue-100 space-y-2">
        <div class="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase">
            <i data-lucide="zap" size="14"></i>
            Sugestão de Horários (<?php echo date('d/m', strtotime($date_pre)); ?>)
        </div>
        <div class="flex flex-wrap gap-2">
            <?php 
                $slots = ["08:00", "10:00", "14:00", "16:00"];
                foreach($slots as $s):
                    $is_taken = in_array($s, $occupied_slots);
            ?>
                <button onclick="document.getElementById('time-input').value = '<?php echo $s; ?>'" 
                    class="px-4 py-2 rounded-xl text-[10px] font-bold transition-all <?php echo $is_taken ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-500 shadow-sm hover:scale-105'; ?>"
                    <?php echo $is_taken ? 'disabled' : ''; ?>>
                    <?php echo $s; ?> <?php echo $is_taken ? '(Ocupado)' : ''; ?>
                </button>
            <?php endforeach; ?>
        </div>
    </div>

    <form method="POST" class="space-y-6">
        <div class="space-y-4">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Dados do Cliente</h3>
            
            <div class="space-y-1.5">
                <input type="text" name="name" required placeholder="Nome Completo"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <input type="text" name="contact" placeholder="Telemóvel"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none">
                <input type="email" name="email" placeholder="Email"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none">
            </div>

            <div class="space-y-1.5">
                <input type="text" name="address" required placeholder="Morada Completa"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none">
            </div>

            <div class="space-y-1.5">
                <input type="text" name="district" placeholder="Cidade / Distrito"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none">
            </div>
        </div>

        <div class="space-y-4 pt-4 border-t border-gray-100">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detalhes do Serviço</h3>

            <div class="space-y-1.5">
                <select name="serviceType" class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none appearance-none">
                    <option>Limpeza Padrão</option>
                    <option>Limpeza Profunda</option>
                    <option>Limpeza Pós-Obra</option>
                    <option>Passar a Ferro</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Data</label>
                    <input type="date" name="date" id="date-input" value="<?php echo $date_pre; ?>"
                        class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:outline-none">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Hora</label>
                    <input type="time" name="time" id="time-input" value="09:00"
                        class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:outline-none">
                </div>
            </div>

            <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Preço (€)</label>
                <input type="number" step="0.01" name="price" placeholder="0.00"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:outline-none text-blue-600 font-bold">
            </div>

            <div class="space-y-1.5">
                <textarea name="comment" rows="3" placeholder="Observações..."
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none"></textarea>
            </div>
        </div>

        <button type="submit" 
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-blue-200">
            Confirmar Agendamento
        </button>
    </form>
</main>

<?php include 'inc/footer.php'; ?>
