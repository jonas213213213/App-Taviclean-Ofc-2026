<?php
require_once 'config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';
    
    $conn = get_db_connection();
    $stmt = $conn->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($admin = $result->fetch_assoc()) {
        if (password_verify($pass, $admin['password'])) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_name'] = $admin['name'];
            write_log("Utilizador logado: " . $admin['username'], "auth");
            header("Location: index.php");
            exit;
        }
    }
    write_log("Falha de login para o utilizador: $user", "warning");
    $error = 'Utilizador ou senha incorretos.';
}

include 'inc/header.php';
?>

<main class="flex-1 flex flex-col justify-center p-8 space-y-10">
    <div class="text-center space-y-2">
        <div class="w-20 h-20 bg-primary rounded-[32px] mx-auto flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-6 transition-transform hover:rotate-6">
            <i data-lucide="sparkles" size="40" fill="white"></i>
        </div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">TaviClean</h1>
        <p class="text-slate-500 font-semibold tracking-tight uppercase text-[10px]">Professional Cleaning Suite</p>
    </div>

    <form method="POST" class="space-y-6">
        <?php if ($error): ?>
            <div class="bg-red-50 text-red-600 p-4 rounded-[20px] text-xs font-bold border border-red-100 flex items-center gap-3 animate-shake">
                <i data-lucide="alert-circle" size="18"></i>
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <div class="space-y-4">
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Identificação</label>
                <div class="relative group">
                    <i data-lucide="user" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"></i>
                    <input type="text" name="username" required
                        class="w-full pl-14 pr-6 py-5 bg-white rounded-[24px] border border-slate-100 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-slate-300 font-medium text-slate-800"
                        placeholder="Nome de utilizador">
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Palavra-passe</label>
                <div class="relative group">
                    <i data-lucide="lock" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"></i>
                    <input type="password" name="password" required
                        class="w-full pl-14 pr-6 py-5 bg-white rounded-[24px] border border-slate-100 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-slate-300 font-medium text-slate-800"
                        placeholder="••••••••">
                </div>
            </div>
        </div>

        <button type="submit" 
            class="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-[0.1em] text-sm shadow-xl shadow-primary/25 active:scale-95 transition-all">
            Aceder ao Painel
        </button>
    </form>

    <div class="text-center space-y-4">
        <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Backup System v4.2.0
        </p>
    </div>
</main>

<?php include 'inc/footer.php'; ?>
