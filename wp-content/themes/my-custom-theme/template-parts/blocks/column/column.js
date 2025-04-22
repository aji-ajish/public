(function () {
  const { createBlock } = wp.blocks;
  const { dispatch } = wp.data;
  const { Fragment, useState } = wp.element;
  const { InnerBlocks } = wp.blockEditor;

  wp.domReady(() => {
    const unsubscribe = wp.data.subscribe(() => {
      const selectedBlock = wp.data
        .select("core/block-editor")
        .getSelectedBlock();

      // Only open the popup ONCE per new selection
      if (
        selectedBlock &&
        selectedBlock.name === "acf/column" &&
        !document.querySelector(".column-popup")
      ) {
        showColumnPopup(selectedBlock.clientId);

        // 🔥 Unsubscribe after showing popup once
        unsubscribe();
      }
    });
  });

  function showColumnPopup(clientId) {
    const popup = document.createElement("div");
    popup.className = "column-popup";
    popup.innerHTML = `
        <div class="column-popup-inner">
          <h3>Configure Columns</h3>
          <div id="column-settings"></div>
          <button id="add-row">+ Add Breakpoint</button>
          <div class="popup-actions">
            <button id="apply-columns">Apply</button>
            <button id="cancel-columns">Cancel</button>
          </div>
        </div>
      `;

    document.body.appendChild(popup);

    const container = popup.querySelector("#column-settings");
    addBreakpointRow(container);

    popup.querySelector("#add-row").addEventListener("click", () => {
      addBreakpointRow(container);
    });

    popup.querySelector("#apply-columns").addEventListener("click", () => {
      const rows = container.querySelectorAll(".breakpoint-row");
      const columns = [];

      rows.forEach((row) => {
        const breakpoint = row.querySelector(".breakpoint").value;
        const count = parseInt(row.querySelector(".count").value);

        if (breakpoint && count && count <= 12) {
          for (let i = 0; i < count; i++) {
            const className = `col-${breakpoint}-${Math.floor(12 / count)}`;
            columns.push(
              createBlock("acf/column", {
                className,
                templateLock: false, // 👈 This enables direct insertion
              })
            );
          }
        }
      });

      dispatch("core/block-editor").replaceInnerBlocks(clientId, columns, true);
      popup.remove();
    });

    popup.querySelector("#cancel-columns").addEventListener("click", () => {
      popup.remove();
      // Clear current block selection to prevent popup retrigger
      wp.data.dispatch("core/block-editor").clearSelectedBlock();
    });
  }

  function addBreakpointRow(container) {
    const row = document.createElement("div");
    row.className = "breakpoint-row";
    row.innerHTML = `
        <select class="breakpoint">
          <option value="xs">xs</option>
          <option value="sm">sm</option>
          <option value="md">md</option>
          <option value="lg">lg</option>
          <option value="xl">xl</option>
          <option value="xxl">xxl</option>
        </select>
        <input type="number" class="count" min="1" max="12" value="2" />
        <button class="remove">×</button>
      `;
    container.appendChild(row);

    row.querySelector(".remove").addEventListener("click", () => {
      row.remove();
    });
  }
})();
