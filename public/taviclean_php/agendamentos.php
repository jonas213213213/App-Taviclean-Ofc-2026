<?php
require_once 'config.php';
check_auth();
$conn = get_db_connection();

// Buscar todos os agendamentos para o calendário
$result = $conn->query("SELECT * FROM appointments ORDER BY date DESC, startTime ASC");
$events = [];
while($row = $result->fetch_assoc()) {
    $events[] = [
        'id' => $row['id'],
        'title' => $row['customerName'] . ' - ' . $row['serviceType'],
        'start' => $row['date'] . 'T' . $row['startTime'],
        'extendedProps' => [
            'status' => $row['status'],
            'price' => $row['price']
        ],
        'color' => $row['status'] === 'Concluído' ? '#38A169' : ($row['status'] === 'Pendente' ? '#ED8936' : '#3182CE')
    ];
}

include 'inc/header.php';
?>

<!-- FullCalendar Deps -->
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js'></script>

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex flex-col gap-4 sticky top-0 z-30">
    <div class="flex items-center justify-between">
        <button onclick="toggleMenu()" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <i data-lucide="menu"></i>
        </button>
        <h1 class="text-lg font-bold text-gray-800">Agenda Inteligente</h1>
        <a href="agendar.php" class="p-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-100">
            <i data-lucide="plus" size="20"></i>
        </a>
    </div>

    <!-- Toggle View -->
    <div class="flex bg-gray-100 p-1 rounded-2xl">
        <button onclick="setView('calendar')" id="btn-calendar" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all bg-white shadow-sm">Calendário</button>
        <button onclick="setView('list')" id="btn-list" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all text-gray-400">Lista</button>
    </div>
</header>

<main class="flex-1 overflow-y-auto p-5 no-scrollbar pb-24">
    <!-- View Calendário -->
    <div id="view-calendar" class="bg-white rounded-3xl p-2 border border-gray-50">
        <div id="calendar" class="h-[600px]"></div>
    </div>

    <!-- View Lista (Escondida por padrão) -->
    <div id="view-list" class="hidden space-y-3">
        <?php 
        $result->data_seek(0);
        while($row = $result->fetch_assoc()): 
        ?>
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
                    </div>
                </div>
            </a>
        <?php endwhile; ?>
    </div>
</main>

<script>
    let calendar;

    document.addEventListener('DOMContentLoaded', function() {
        const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: {
                left: 'prev,next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
            },
            events: <?php echo json_encode($events); ?>,
            eventClick: function(info) {
                window.location.href = 'detalhes_agendamento.php?id=' + info.event.id;
            },
            dateClick: function(info) {
                window.location.href = 'agendar.php?date=' + info.dateStr;
            },
            height: 'auto',
            themeSystem: 'standard'
        });
        calendar.render();
    });

    function setView(view) {
        const calView = document.getElementById('view-calendar');
        const listView = document.getElementById('view-list');
        const btnCal = document.getElementById('btn-calendar');
        const btnList = document.getElementById('btn-list');

        if (view === 'calendar') {
            calView.classList.remove('hidden');
            listView.classList.add('hidden');
            btnCal.classList.add('bg-white', 'shadow-sm');
            btnCal.classList.remove('text-gray-400');
            btnList.classList.add('text-gray-400');
            btnList.classList.remove('bg-white', 'shadow-sm');
            calendar.render();
        } else {
            calView.classList.add('hidden');
            listView.classList.remove('hidden');
            btnList.classList.add('bg-white', 'shadow-sm');
            btnList.classList.remove('text-gray-400');
            btnCal.classList.add('text-gray-400');
            btnCal.classList.remove('bg-white', 'shadow-sm');
        }
    }
</script>

<style>
    .fc { font-family: 'Inter', sans-serif; --fc-border-color: #f1f5f9; --fc-button-bg-color: #3b82f6; --fc-button-border-color: #3b82f6; }
    .fc-toolbar-title { font-size: 1.1rem !important; font-weight: 800; color: #1e293b; }
    .fc-button { font-size: 0.7rem !important; font-weight: 700 !important; text-transform: uppercase !important; border-radius: 12px !important; }
    .fc-daygrid-day-number { font-size: 0.8rem; font-weight: 600; color: #64748b; }
    .fc-event { border-radius: 8px !important; padding: 2px 4px !important; border: none !important; cursor: pointer; }
</style>

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
