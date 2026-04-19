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

<header class="bg-white px-5 pt-10 pb-4 border-b border-slate-100 flex flex-col gap-4 sticky top-0 z-30 transition-all shadow-sm">
    <div class="flex items-center justify-between">
        <button onclick="toggleMenu()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full">
            <i data-lucide="menu"></i>
        </button>
        <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TaviClean</span>
            <h1 class="text-lg font-bold text-slate-800 tracking-tight">Agenda Inteligente</h1>
        </div>
        <a href="agendar.php" class="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
            <i data-lucide="plus" size="20"></i>
        </a>
    </div>

    <!-- Toggle View Tabs -->
    <div class="flex bg-slate-100 p-1 rounded-2xl">
        <button onclick="setView('calendar')" id="btn-calendar" class="flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all bg-white shadow-sm text-primary">Calendário</button>
        <button onclick="setView('list')" id="btn-list" class="flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all text-slate-400">Lista Próximos</button>
    </div>
</header>

<main class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
    <!-- View Calendário -->
    <div id="view-calendar" class="space-y-4 animate-fade-in">
        <div class="bg-white rounded-[32px] p-4 shadow-sm border border-slate-100 overflow-hidden">
            <div id="calendar" class="text-xs"></div>
        </div>
    </div>

    <!-- View Lista -->
    <div id="view-list" class="hidden space-y-3 animate-fade-in">
        <?php 
        $result->data_seek(0);
        if ($result->num_rows > 0):
            while($row = $result->fetch_assoc()): 
        ?>
            <a href="detalhes_agendamento.php?id=<?php echo $row['id']; ?>" class="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer">
                <div class="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    <img src="https://picsum.photos/seed/<?php echo urlencode($row['customerName']); ?>/100/100" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h4 class="font-extrabold text-sm text-slate-800 tracking-tight"><?php echo htmlspecialchars($row['customerName']); ?></h4>
                    <div class="flex items-center gap-2">
                        <p class="text-[10px] font-bold text-primary uppercase"><?php echo date('d/m', strtotime($row['date'])); ?></p>
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-bold uppercase">
                            <?php echo $row['status']; ?>
                        </span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs font-black text-slate-800"><?php echo substr($row['startTime'], 0, 5); ?></p>
                </div>
            </a>
        <?php 
            endwhile; 
        else:
        ?>
            <div class="bg-white p-12 rounded-[40px] border border-slate-100 text-center space-y-3 shadow-sm">
                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                    <i data-lucide="calendar-x" size="28"></i>
                </div>
                <p class="text-xs font-bold text-slate-400">Sem agendamentos futuros.</p>
            </div>
        <?php endif; ?>
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

<?php include 'inc/footer.php'; ?>
