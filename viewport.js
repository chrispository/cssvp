// CSS Animation Viewport - Interactive JavaScript Engine

class CSSAnimationViewport {
    constructor() {
        this.viewportScene = document.querySelector('.viewport-scene');
        this.cssOutput = document.getElementById('cssOutput');
        this.layerList = document.querySelector('.layer-list');

        this.layers = {};
        this.activeLayerId = null;

        this.animation = {};

        this.init();
    }

    init() {
        this.addLayer('Base Layer', false);
        this.setupEventListeners();
        this.makePanelsDraggable();
    }

    setupEventListeners() {
        // Transform controls
        document.getElementById('translateX').addEventListener('input', (e) => this.updateTransform('translateX', e.target.value));
        document.getElementById('translateY').addEventListener('input', (e) => this.updateTransform('translateY', e.target.value));
        document.getElementById('translateZ').addEventListener('input', (e) => this.updateTransform('translateZ', e.target.value));

        document.getElementById('scaleX').addEventListener('input', (e) => this.updateTransform('scaleX', e.target.value));
        document.getElementById('scaleY').addEventListener('input', (e) => this.updateTransform('scaleY', e.target.value));
        document.getElementById('scaleZ').addEventListener('input', (e) => this.updateTransform('scaleZ', e.target.value));

        document.getElementById('rotateX').addEventListener('input', (e) => this.updateTransform('rotateX', e.target.value));
        document.getElementById('rotateY').addEventListener('input', (e) => this.updateTransform('rotateY', e.target.value));
        document.getElementById('rotateZ').addEventListener('input', (e) => this.updateTransform('rotateZ', e.target.value));

        // Transform value inputs
        document.getElementById('translateXValue').addEventListener('input', (e) => this.updateTransform('translateX', e.target.value));
        document.getElementById('translateYValue').addEventListener('input', (e) => this.updateTransform('translateY', e.target.value));
        document.getElementById('translateZValue').addEventListener('input', (e) => this.updateTransform('translateZ', e.target.value));

        document.getElementById('scaleXValue').addEventListener('input', (e) => this.updateTransform('scaleX', e.target.value));
        document.getElementById('scaleYValue').addEventListener('input', (e) => this.updateTransform('scaleY', e.target.value));
        document.getElementById('scaleZValue').addEventListener('input', (e) => this.updateTransform('scaleZ', e.target.value));

        document.getElementById('rotateXValue').addEventListener('input', (e) => this.updateTransform('rotateX', e.target.value));
        document.getElementById('rotateYValue').addEventListener('input', (e) => this.updateTransform('rotateY', e.target.value));
        document.getElementById('rotateZValue').addEventListener('input', (e) => this.updateTransform('rotateZ', e.target.value));

        // Animation controls
        document.getElementById('duration').addEventListener('input', (e) => this.updateAnimation('duration', e.target.value));
        document.getElementById('delay').addEventListener('input', (e) => this.updateAnimation('delay', e.target.value));
        document.getElementById('iterationCount').addEventListener('change', (e) => this.updateAnimation('iterationCount', e.target.value));
        document.getElementById('direction').addEventListener('change', (e) => this.updateAnimation('direction', e.target.value));
        document.getElementById('timingFunction').addEventListener('change', (e) => this.updateAnimation('timingFunction', e.target.value));

        // Gradient controls
        document.getElementById('gradientType').addEventListener('change', (e) => this.updateGradient('type', e.target.value));
        document.getElementById('color1').addEventListener('input', (e) => this.updateGradient('colors', 0, e.target.value));
        document.getElementById('color2').addEventListener('input', (e) => this.updateGradient('colors', 1, e.target.value));
        document.getElementById('position1').addEventListener('input', (e) => this.updateGradient('positions', 0, e.target.value));
        document.getElementById('position2').addEventListener('input', (e) => this.updateGradient('positions', 1, e.target.value));

        // Animation buttons
        document.getElementById('playAnimation').addEventListener('click', () => this.playAnimation());
        document.getElementById('pauseAnimation').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('resetAnimation').addEventListener('click', () => this.resetAnimation());

        // Copy CSS
        document.getElementById('copyCSS').addEventListener('click', () => this.copyCSS());

        // Layer management
        document.getElementById('addLayer').addEventListener('click', () => this.addLayer());

        // Panel close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.floating-panel').style.display = 'none';
            });
        });
    }

    updateTransform(property, value) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        const parsedValue = parseFloat(value);

        if (isNaN(parsedValue)) return;

        layer.transforms[property] = parsedValue;
        this.updateElement(layer);
        this.updateCSS();

        // Sync the corresponding input elements
        const rangeInput = document.getElementById(property);
        const valueInput = document.getElementById(`${property}Value`);

        if (rangeInput.value !== value) {
            rangeInput.value = value;
        }
        if (valueInput.value !== value) {
            valueInput.value = value;
        }
    }

    updateAnimation(property, value) {
        this.animation[property] = value;
        this.updateCSS();

        const displayElement = document.getElementById(`${property}Value`);
        if (displayElement) {
            displayElement.textContent = value;
        }
    }

    updateGradient(property, index, value) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        if (index !== undefined) {
            layer.gradient[property][index] = value;
        } else {
            layer.gradient[property] = value;
        }
        this.updateElement(layer);
        this.updateCSS();
    }

    updateElement(layer) {
        const transform = `
            translate3d(${layer.transforms.translateX}px, ${layer.transforms.translateY}px, ${layer.transforms.translateZ}px)
            scale3d(${layer.transforms.scaleX}, ${layer.transforms.scaleY}, ${layer.transforms.scaleZ})
            rotateX(${layer.transforms.rotateX}deg)
            rotateY(${layer.transforms.rotateY}deg)
            rotateZ(${layer.transforms.rotateZ}deg)
        `;
        layer.element.style.transform = transform;

        const gradient = layer.gradient.type === 'linear'
            ? `linear-gradient(45deg, ${layer.gradient.colors[0]} ${layer.gradient.positions[0]}%, ${layer.gradient.colors[1]} ${layer.gradient.positions[1]}%)`
            : `radial-gradient(circle, ${layer.gradient.colors[0]} ${layer.gradient.positions[0]}%, ${layer.gradient.colors[1]} ${layer.gradient.positions[1]}%)`;
        layer.element.style.background = gradient;
    }

    updateCSS() {
        let css = '/* CSS Animation Generated by CSS Animation Viewport */\n';
        for (const layerId in this.layers) {
            const layer = this.layers[layerId];
            css += `
#${layer.id} {
    width: 200px;
    height: 200px;
    position: absolute;
    background: ${layer.gradient.type === 'linear'
        ? `linear-gradient(45deg, ${layer.gradient.colors[0]} ${layer.gradient.positions[0]}%, ${layer.gradient.colors[1]} ${layer.gradient.positions[1]}%)`
        : `radial-gradient(circle, ${layer.gradient.colors[0]} ${layer.gradient.positions[0]}%, ${layer.gradient.colors[1]} ${layer.gradient.positions[1]}%)`};
    border-radius: 8px;
    transform: translate3d(${layer.transforms.translateX}px, ${layer.transforms.translateY}px, ${layer.transforms.translateZ}px)
               scale3d(${layer.transforms.scaleX}, ${layer.transforms.scaleY}, ${layer.transforms.scaleZ})
               rotateX(${layer.transforms.rotateX}deg)
               rotateY(${layer.transforms.rotateY}deg)
               rotateZ(${layer.transforms.rotateZ}deg);
    transition: transform ${this.animation.duration || 0}s ${this.animation.timingFunction || 'ease'} ${this.animation.delay || 0}s;
    animation: ${layer.id}-animation ${this.animation.duration || 0}s ${this.animation.timingFunction || 'ease'} ${this.animation.delay || 0}s ${this.animation.iterationCount || 1} ${this.animation.direction || 'normal'};
}

@keyframes ${layer.id}-animation {
    from {
        transform: translate3d(0,0,0) scale3d(1,1,1) rotateX(0) rotateY(0) rotateZ(0);
    }
    to {
        transform: translate3d(${layer.transforms.translateX}px, ${layer.transforms.translateY}px, ${layer.transforms.translateZ}px)
                   scale3d(${layer.transforms.scaleX}, ${layer.transforms.scaleY}, ${layer.transforms.scaleZ})
                   rotateX(${layer.transforms.rotateX}deg)
                   rotateY(${layer.transforms.rotateY}deg)
                   rotateZ(${layer.transforms.rotateZ}deg);
    }
}
        `.trim() + '\n\n';
        }
        this.cssOutput.value = css;
    }

    addLayer(name, isPrompt = true) {
        const layerName = isPrompt ? prompt('Enter layer name:') : name;
        if (layerName) {
            const id = `layer-${Date.now()}`;
            const newElement = document.createElement('div');
            newElement.className = 'animated-rectangle';
            newElement.id = id;
            this.viewportScene.appendChild(newElement);

            const numLayers = Object.keys(this.layers).length;

            this.layers[id] = {
                id: id,
                name: layerName,
                element: newElement,
                visible: true,
                transforms: {
                    translateX: 10 * numLayers,
                    translateY: 10 * numLayers,
                    translateZ: 0,
                    scaleX: 1,
                    scaleY: 1,
                    scaleZ: 1,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0
                },
                gradient: {
                    type: 'linear',
                    colors: ['#3498db', '#e74c3c'],
                    positions: [0, 100]
                }
            };

            this.updateElement(this.layers[id]);
            this.addLayerToUI(id, layerName);
            this.setActiveLayer(id);
            this.updateCSS();
        }
    }

    addLayerToUI(id, name) {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.layer = id;
        layerItem.innerHTML = `
            <span>${name}</span>
            <div class="layer-controls">
                <button class="visibility-btn">👁</button>
                <button class="delete-btn">×</button>
            </div>
        `;
        this.layerList.appendChild(layerItem);

        layerItem.addEventListener('click', () => this.setActiveLayer(id));
        layerItem.querySelector('.visibility-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLayerVisibility(id);
        });
        layerItem.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteLayer(id);
        });
    }

    setActiveLayer(id) {
        if (this.activeLayerId) {
            document.querySelector(`[data-layer="${this.activeLayerId}"]`).classList.remove('active');
        }
        this.activeLayerId = id;
        document.querySelector(`[data-layer="${id}"]`).classList.add('active');
        this.updateControlsToLayer(this.layers[id]);
    }

    updateControlsToLayer(layer) {
        for (const prop in layer.transforms) {
            const input = document.getElementById(prop);
            if (input) input.value = layer.transforms[prop];
            const valueInput = document.getElementById(`${prop}Value`);
            if (valueInput) {
                valueInput.value = layer.transforms[prop];
            }
        }
        document.getElementById('gradientType').value = layer.gradient.type;
        document.getElementById('color1').value = layer.gradient.colors[0];
        document.getElementById('color2').value = layer.gradient.colors[1];
        document.getElementById('position1').value = layer.gradient.positions[0];
        document.getElementById('position2').value = layer.gradient.positions[1];
    }

    toggleLayerVisibility(id) {
        const layer = this.layers[id];
        layer.visible = !layer.visible;
        layer.element.style.display = layer.visible ? '' : 'none';
        const btn = document.querySelector(`[data-layer="${id}"] .visibility-btn`);
        btn.textContent = layer.visible ? '👁' : '👁‍🗨';
    }

    deleteLayer(id) {
        if (Object.keys(this.layers).length <= 1) {
            alert('Cannot delete the last layer.');
            return;
        }
        const layer = this.layers[id];
        layer.element.remove();
        document.querySelector(`[data-layer="${id}"]`).remove();
        delete this.layers[id];

        if (this.activeLayerId === id) {
            this.activeLayerId = null;
            const remainingLayerIds = Object.keys(this.layers);
            if (remainingLayerIds.length > 0) {
                this.setActiveLayer(remainingLayerIds[0]);
            }
        }
        this.updateCSS();
    }

    playAnimation() {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer.element.style.animation = 'none';
        void layer.element.offsetWidth; // Trigger reflow
        layer.element.style.animation = `${layer.id}-animation ${this.animation.duration}s ${this.animation.timingFunction} ${this.animation.delay}s ${this.animation.iterationCount} ${this.animation.direction}`;
    }

    pauseAnimation() {
        if (!this.activeLayerId) return;
        this.layers[this.activeLayerId].element.style.animationPlayState = 'paused';
    }

    resetAnimation() {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer.element.style.animation = 'none';
        
        layer.transforms = {
            translateX: 0, translateY: 0, translateZ: 0,
            scaleX: 1, scaleY: 1, scaleZ: 1,
            rotateX: 0, rotateY: 0, rotateZ: 0
        };
        this.updateElement(layer);
        this.updateControlsToLayer(layer);
        this.updateCSS();
    }

    copyCSS() {
        this.cssOutput.select();
        document.execCommand('copy');
        const button = document.getElementById('copyCSS');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1500);
    }

    makePanelsDraggable() {
        const panels = document.querySelectorAll('.floating-panel');
        panels.forEach(panel => {
            const header = panel.querySelector('.panel-header');
            let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

            header.addEventListener('mousedown', e => {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                if (e.target === header || header.contains(e.target)) isDragging = true;
            });
            document.addEventListener('mousemove', e => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
            });
            document.addEventListener('mouseup', () => isDragging = false);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cssViewport = new CSSAnimationViewport();
});
