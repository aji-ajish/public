(function () {
  const { createBlock } = wp.blocks;
  const { dispatch, select, subscribe } = wp.data;

  function addEditButtonToColumns() {
    document.querySelectorAll('[data-type="acf/column"]').forEach((el) => {
      if (!el.querySelector(".edit-column-btn")) {
        const button = document.createElement("button");
        button.className = "edit-column-btn";
        button.innerText = "⚙️";
        button.style.position = "absolute";
        button.style.top = "5px";
        button.style.right = "5px";
        button.style.zIndex = "10";
        button.style.padding = "2px 6px";
        button.style.fontSize = "14px";

        button.addEventListener("click", (e) => {
          e.stopPropagation();
          const blockId = el.dataset.block;
          const block = select("core/block-editor").getBlock(blockId);
          showColumnPopup(block.clientId, block.attributes.className);
        });

        el.style.position = "relative";
        el.appendChild(button);
      }
    });
  }

  wp.domReady(() => {
    const unsubscribe = subscribe(() => {
      const selectedBlock = select("core/block-editor").getSelectedBlock();

      if (
        selectedBlock &&
        selectedBlock.name === "acf/column" &&
        !document.querySelector(".column-popup") &&
        !selectedBlock.attributes.className
      ) {
        showColumnPopup(selectedBlock.clientId, "");
        unsubscribe();
      }

      addEditButtonToColumns();
    });
  });

  function showColumnPopup(clientId, existingClassNames = "") {
    const popup = document.createElement("div");
    popup.className = "column-popup";
    popup.innerHTML = `
      <div class="column-popup-inner" id="popup-inner" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:#fff; padding:20px; border:1px solid #ccc; z-index:99999; min-width:300px;">
        <div class="popup-header" style="cursor:move; background:#f2f2f2; padding:6px 10px; margin:-20px -20px 10px -20px; border-bottom:1px solid #ccc;">
          <strong>Configure Column</strong>
        </div>
        <div id="column-settings"></div>
        <button id="add-row">+ Add Breakpoint</button>
        <div style="margin-top:10px;">
          <label><strong>Custom Class:</strong></label>
          <input type="text" id="custom-class" placeholder="e.g. my-class" style="width:100%; margin-top:4px;" />
        </div>
        <div class="popup-actions" style="margin-top:15px; display:flex; justify-content:space-between;">
          <button id="apply-columns">Apply</button>
          <button id="cancel-columns">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    const container = popup.querySelector("#column-settings");
    const customInput = popup.querySelector("#custom-class");

    // Parse classes if any exist
    const existing = existingClassNames ? existingClassNames.split(/\s+/) : [];
    const parsed = existing
      .map((cls) => {
        const match = cls.match(/^col-(xs|sm|md|lg|xl|xxl)-(\d{1,2})$/);
        return match ? { bp: match[1], count: 12 / parseInt(match[2]) } : null;
      })
      .filter(Boolean);

    const extraClass = existing
      .filter((cls) => !/^col-(xs|sm|md|lg|xl|xxl)-\d{1,2}$/.test(cls))
      .join(" ");

    if (parsed.length) {
      parsed.forEach(({ bp, count }) => addBreakpointRow(container, bp, count));
    } else {
      addBreakpointRow(container);
    }

    customInput.value = extraClass;

    popup.querySelector("#add-row").addEventListener("click", () => {
      addBreakpointRow(container);
    });

    popup.querySelector("#apply-columns").addEventListener("click", () => {
      const rows = container.querySelectorAll(".breakpoint-row");
      const classParts = [];

      rows.forEach((row) => {
        const bp = row.querySelector(".breakpoint").value;
        const count = parseInt(row.querySelector(".count").value);
        if (bp && count && count <= 12) {
          classParts.push(`col-${bp}-${Math.floor(12 / count)}`);
        }
      });

      const customClass = customInput.value.trim();
      if (customClass) classParts.push(customClass);

      dispatch("core/block-editor").updateBlockAttributes(clientId, {
        className: classParts.join(" "),
      });

      popup.remove();
    });

    popup.querySelector("#cancel-columns").addEventListener("click", () => {
      popup.remove();
    });

    // Drag popup
    makeDraggable(popup.querySelector("#popup-inner"), popup.querySelector(".popup-header"));
  }

  function addBreakpointRow(container, breakpoint = "sm", count = 2) {
    const row = document.createElement("div");
    row.className = "breakpoint-row";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <select class="breakpoint">
        <option value="xs">xs</option>
        <option value="sm">sm</option>
        <option value="md">md</option>
        <option value="lg">lg</option>
        <option value="xl">xl</option>
        <option value="xxl">xxl</option>
      </select>
      <input type="number" class="count" min="1" max="12" value="${count}" style="width:60px; margin: 0 8px;" />
      <button class="remove">×</button>
    `;
    row.querySelector(".breakpoint").value = breakpoint;
    row.querySelector(".remove").addEventListener("click", () => row.remove());
    container.appendChild(row);
  }

  function makeDraggable(popup, handle) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    handle.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - popup.offsetLeft;
      offsetY = e.clientY - popup.offsetTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        popup.style.left = e.clientX - offsetX + "px";
        popup.style.top = e.clientY - offsetY + "px";
        popup.style.transform = "none"; // remove center transform
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  }
})();
