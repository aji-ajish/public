<?php

// Theme setup
add_action('after_setup_theme', function () {
    add_theme_support('title-tag'); // Auto page titles
    add_theme_support('post-thumbnails'); // Featured images
    add_theme_support('editor-styles');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');

    // Load custom editor styles (optional, if you want to include editor-style.css)
    add_editor_style('editor-style.css');
});

// Enqueue frontend styles
add_action('wp_enqueue_scripts', function () {
    // Bootstrap CSS (Frontend)
    wp_enqueue_style('bootstrap', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');

    // Theme stylesheet
    wp_enqueue_style('theme-style', get_stylesheet_uri());

    // Custom block styles
    wp_enqueue_style('blocks-style', get_template_directory_uri() . '/blocks.css', [], '1.0');
});

// Enqueue editor styles
function load_editor_styles()
{
    // Bootstrap CSS (Editor)
    wp_enqueue_style('bootstrap-editor', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', false, null);
    wp_enqueue_style('editor-custom-style', get_template_directory_uri() . '/editor-style.css', [], '1.0');
}
add_action('enqueue_block_editor_assets', 'load_editor_styles');

// Register custom ACF block category
add_filter('block_categories', function ($categories) {
    return array_merge(
        $categories,
        [
            [
                'slug'  => 'custom-blocks',
                'title' => 'Custom Blocks',
            ],
        ]
    );
});

// Register ACF Container block
add_action('acf/init', function () {
    if (function_exists('acf_register_block_type')) {
        acf_register_block_type([
            'name' => 'container',
            'title' => 'Container',
            'description' => 'A responsive container block like Bootstrap.',
            'render_template' => 'template-parts/blocks/container/container.php',
            'category' => 'custom-blocks',
            'icon' => 'screenoptions',
            'supports' => [
                'jsx' => true, // Enables live editor preview
                'align' => true,
                'mode' => false,
            ],
        ]);

        acf_register_block_type([
            'name' => 'row',
            'title' => 'Row',
            'description' => 'Bootstrap Row block',
            'render_template' => 'template-parts/blocks/row/row.php',
            'category' => 'custom-blocks',
            'icon' => 'columns',
            'supports' => [
                'jsx' => true,
                'align' => false,
                'mode' => false,
            ],
        ]);



        // Register Column block
        acf_register_block_type([
            'name' => 'column',
            'title' => 'Column',
            'description' => 'Bootstrap Column block',
            'render_template' => 'template-parts/blocks/column/column.php',
            'category' => 'custom-blocks',
            'icon' => 'align-pull-left',
            'supports' => [
                'jsx' => true,
                'align' => false,
                'mode' => false,
            ],
            'parent' => ['acf/row'], // ✅ Only inside Row
        ]);
    }
});

// Add Bootstrap classes dynamically to the container block's wrapper
add_filter('acf/blocks/render_block_wrapper_attributes', function ($wrapper_attributes, $block) {
    // Only run for the container block
    if ($block['name'] !== 'acf/container') return $wrapper_attributes;

    $container_type = get_field('container_type');
    $custom_class = get_field('custom_class');

    $classes = [$container_type];


    // Add custom class if provided
    if ($custom_class) {
        $classes[] = $custom_class;
    }

    // Append classes to the wrapper
    if (preg_match('/class="([^"]*)"/', $wrapper_attributes, $matches)) {
        $existing_classes = $matches[1];
        $new_classes = $existing_classes . ' ' . implode(' ', $classes);
        $wrapper_attributes = preg_replace('/class="[^"]*"/', 'class="' . esc_attr($new_classes) . '"', $wrapper_attributes);
    } else {
        $wrapper_attributes .= ' class="' . esc_attr(implode(' ', $classes)) . '"';
    }

    return $wrapper_attributes;
}, 10, 2);
