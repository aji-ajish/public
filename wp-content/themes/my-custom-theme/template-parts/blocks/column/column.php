<?php
$class_name = $block['className'] ?? '';
?>
<div class="<?php echo esc_attr($class_name); ?>">
    <InnerBlocks />
</div>
