<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

// Processar Criação de Cliente
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_customer'])) {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $district = trim($_POST['district'] ?? '');

    if (empty($name) || empty($email) || empty($contact)) {
        set_flash_message("Nome, Email e Contacto são obrigatórios!", "error");
        write_log("Tentativa de criação de cliente falhou: campos vazios.", "error");
    } else {
        $id = 'c_' . uniqid();
        $stmt = $conn->prepare("INSERT INTO customers (id, name, email, contact, address, district, municipality) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $municipality = $district; // Simplificação
        $stmt->bind_param("sssssss", $id, $name, $email, $contact, $address, $district, $municipality);
        
        if ($stmt->execute()) {
            set_flash_message("Cliente $name criado com sucesso! ✨");
            write_log("Cliente criado: $name ($id)", "info");
        } else {
            set_flash_message("Erro ao criar cliente: " . $conn->error, "error");
            write_log("Erro MySQL ao criar cliente: " . $conn->error, "error");
        }
    }
    header("Location: clientes.php");
    exit;
}

$result = $conn->query("SELECT * FROM customers ORDER BY name ASC");

include 'inc/header.php';
?>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex flex-col gap-4 sticky top-0 z-30">
    <div class="flex items-center justify-between">
        <button onclick="toggleMenu()" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <i data-lucide="menu"></i>
        </button>
        <h1 class="text-lg font-bold text-gray-800">Clientes</h1>
        <button onclick="document.getElementById('modal-cliente').classList.remove('hidden')" class="p-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-100">
            <i data-lucide="plus" size="20"></i>
        </button>
    </div>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar pb-24">
    <div class="space-y-3">
        <?php if ($result->num_rows > 0): ?>
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
        <?php else: ?>
            <div class="text-center py-20 opacity-20">
                <i data-lucide="users" size="48" class="mx-auto mb-4"></i>
                <p>Nenhum cliente registado.</p>
            </div>
        <?php endif; ?>
    </div>
</main>

<!-- Modal Novo Cliente -->
<div id="modal-cliente" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
    <div class="w-full max-w-md bg-white rounded-t-[40px] p-8 space-y-6 animate-slide-up shadow-2xl">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">Novo Cliente</h2>
            <button onclick="document.getElementById('modal-cliente').classList.add('hidden')" class="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                <i data-lucide="x"></i>
            </button>
        </div>

        <form method="POST" class="space-y-4" onsubmit="return validateClientForm()">
            <input type="hidden" name="add_customer" value="1">
            
            <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                <input type="text" name="name" id="c_name" required placeholder="Ex: Maria Pereira"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email *</label>
                    <input type="email" name="email" id="c_email" required placeholder="nome@email.com"
                        class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contacto *</label>
                    <input type="tel" name="contact" id="c_phone" required placeholder="912 345 678"
                        class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm">
                </div>
            </div>

            <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Morada</label>
                <input type="text" name="address" placeholder="Rua do Castelo, nº 10"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all">
            </div>

            <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Distrito</label>
                <input type="text" name="district" placeholder="Lisboa"
                    class="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all">
            </div>

            <button type="submit" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all">
                Criar Cliente
            </button>
        </form>
    </div>
</div>

<script>
    function validateClientForm() {
        const name = document.getElementById('c_name').value;
        const email = document.getElementById('c_email').value;
        const phone = document.getElementById('c_phone').value;

        if (name.length < 3) {
            showToast("Nome muito curto!", "error");
            return false;
        }
        if (!email.includes('@')) {
            showToast("Email inválido!", "error");
            return false;
        }
        return true;
    }
</script>

<style>
    @keyframes slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
    .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
</style>

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
