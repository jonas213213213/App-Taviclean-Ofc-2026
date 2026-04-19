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
            header("Location: index.php");
            exit;
        }
    }
    $error = 'Utilizador ou senha incorretos.';
}

include 'inc/header.php';
?>

<main class="flex-1 flex flex-col justify-center p-8 space-y-10">
    <div class="text-center space-y-2">
        <div class="w-16 h-16 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-4">
            <i data-lucide="sparkles" size="32"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-800">TaviClean</h1>
        <p class="text-gray-500 font-medium tracking-tight">Gestão de Limpezas Profissional</p>
    </div>

    <form method="POST" class="space-y-6">
        <?php if ($error): ?>
            <div class="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <i data-lucide="alert-circle" size="18"></i>
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <div class="space-y-4">
            <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Utilizador</label>
                <div class="relative">
                    <i data-lucide="user" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" name="username" required
                        class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                        placeholder="admin">
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                <div class="relative">
                    <i data-lucide="lock" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="password" name="password" required
                        class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                        placeholder="••••••••">
                </div>
            </div>
        </div>

        <button type="submit" 
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-transform">
            Entrar no Painel
        </button>
    </form>

    <p class="text-center text-xs text-gray-400">
        Esqueceu a senha? Contacte o administrador.
    </p>
</main>

<?php include 'inc/footer.php'; ?>
