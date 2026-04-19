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

<header class="bg-white h-20 flex items-end justify-between px-5 pb-4 border-b border-slate-100 z-30 shrink-0 sticky top-0">
    <button onclick="toggleMenu()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
        <i data-lucide="menu"></i>
    </button>
    <div class="flex flex-col items-center">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TaviClean</span>
        <h1 class="text-lg font-bold text-slate-800 tracking-tight">Gestão de Clientes</h1>
    </div>
    <button onclick="document.getElementById('modal-cliente').classList.remove('hidden')" class="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
        <i data-lucide="user-plus" size="20"></i>
    </button>
</header>

<main class="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar pb-24">
    <div class="space-y-3">
        <?php if ($result->num_rows > 0): ?>
            <?php while($row = $result->fetch_assoc()): ?>
                <a href="detalhes_cliente.php?id=<?php echo $row['id']; ?>" class="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                            <img src="https://picsum.photos/seed/<?php echo urlencode($row['name']); ?>/100/100" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h4 class="font-extrabold text-sm text-slate-800 tracking-tight"><?php echo htmlspecialchars($row['name']); ?></h4>
                            <div class="flex items-center gap-2 mt-0.5">
                                <p class="text-[10px] font-bold text-primary uppercase"><?php echo htmlspecialchars($row['contact']); ?></p>
                                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter"><?php echo htmlspecialchars($row['district'] ?: 'Particular'); ?></p>
                            </div>
                        </div>
                    </div>
                    <div class="text-slate-200">
                        <i data-lucide="chevron-right" size="20"></i>
                    </div>
                </a>
            <?php endwhile; ?>
        <?php else: ?>
            <div class="bg-white p-20 rounded-[40px] border border-slate-100 text-center space-y-4 shadow-sm">
                <div class="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                    <i data-lucide="users" size="32"></i>
                </div>
                <p class="text-xs font-bold text-slate-400 uppercase">Nenhum cliente registado.</p>
            </div>
        <?php endif; ?>
    </div>
</main>

<!-- Modal Novo Cliente -->
<div id="modal-cliente" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-t-[40px] p-8 space-y-8 animate-slide-up shadow-2xl">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-black text-slate-800 tracking-tight text-center flex-1 ml-8">Novo Registo</h2>
            <button onclick="document.getElementById('modal-cliente').classList.add('hidden')" class="p-2 text-slate-300 hover:bg-slate-50 rounded-full">
                <i data-lucide="x"></i>
            </button>
        </div>

        <form method="POST" class="space-y-5" onsubmit="return validateClientForm()">
            <input type="hidden" name="add_customer" value="1">
            
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Dados Pessoais</label>
                <input type="text" name="name" id="c_name" required placeholder="Nome Completo do Cliente"
                    class="w-full p-5 bg-slate-50 rounded-[20px] border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Correio Eletrónico</label>
                    <input type="email" name="email" id="c_email" required placeholder="email@exemplo.pt"
                        class="w-full p-5 bg-slate-50 rounded-[20px] border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all text-xs font-medium">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Telemóvel</label>
                    <input type="tel" name="contact" id="c_phone" required placeholder="9xx xxx xxx"
                        class="w-full p-5 bg-slate-50 rounded-[20px] border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all text-xs font-medium">
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Localização Principal</label>
                <input type="text" name="address" placeholder="Rua, Número e Andar"
                    class="w-full p-5 bg-slate-50 rounded-[20px] border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium">
            </div>

            <button type="submit" class="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all text-sm">
                Guardar Cliente
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

<?php include 'inc/footer.php'; ?>
