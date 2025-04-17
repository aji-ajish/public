<?php
// Get values from ACF fields
$container_type = get_field('container_type');
$custom_class = get_field('custom_class');
$section_class = get_field('section_custom_class');

$classes = [$container_type];



// Add custom class if provided
if ($custom_class) {
  $classes[] = $custom_class;
}

?>
<div class="<?php echo $section_class; ?>">
  <div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
    <?php echo '<InnerBlocks />'; ?>
  </div>
</div>