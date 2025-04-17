<?php
$column_class = get_field('custom_class') ?: 'col';
?>

<div class="<?php echo esc_attr($column_class); ?>">
  <?php echo '<InnerBlocks />'; ?>
</div>
