    </div> <!-- End Main Container -->
    <script>
        // Inicializar ícones Lucide
        lucide.createIcons();

        // Mostrar mensagens flash (PHP -> JS)
        <?php if (isset($_SESSION['flash_message'])): ?>
            showToast("<?php echo $_SESSION['flash_message']; ?>", "<?php echo $_SESSION['flash_type'] ?? 'success'; ?>");
            <?php 
                unset($_SESSION['flash_message']); 
                unset($_SESSION['flash_type']); 
            ?>
        <?php endif; ?>
    </script>
</body>
</html>
