const header = document.getElementById('meet-header') as HTMLHeadingElement;
const grid = document.getElementById(
    'members-collection',
) as HTMLDivElement;
const footer = document.getElementById(
    'footer-disclaimer',
) as HTMLDivElement;

const minHeight = 30; // rem

function getFloatProperty(styles: CSSStyleDeclaration, name: string): number {
    return parseFloat(styles.getPropertyValue(name));
}

function getElementFullHeight(element: HTMLElement): number {
    const style = globalThis.getComputedStyle(element);

    const fP = getFloatProperty.bind(undefined, style);
    const marginTop = fP('margin-top');
    const paddingTop = fP('padding-top');
    const paddingBottom = fP('padding-bottom');
    const marginBottom = fP('margin-bottom');

    const clientHeight = element.getBoundingClientRect().height;

    return marginTop + paddingTop + clientHeight + paddingBottom + marginBottom;
}

function setSectionHeight(section: HTMLElement, height: number) {
    const headingHeight = getElementFullHeight(
        section.children[0] as HTMLHeadingElement,
    );
    const tabGroup = section.children[1] as HTMLElement;
    tabGroup.style.height = `${height - headingHeight}px`;
    // TODO: add a class that triggers this and other effects such as the grid layout shift
    tabGroup.style.overflowY = 'scroll';
}

function resize() {
    const windowHeight = globalThis.innerHeight;

    const headerHeight = getElementFullHeight(header);
    const footerHeight = getElementFullHeight(footer);
    const space = windowHeight - headerHeight - footerHeight;

    const rootFontSize = parseFloat(
        globalThis.getComputedStyle(document.documentElement)
            .getPropertyValue('font-size'),
    );

    const spaceRem = space / rootFontSize;
    if (spaceRem < minHeight) {
        // TODO: fall back to the full-page layout and remove previous layout
    }

    const gridGap = getFloatProperty(globalThis.getComputedStyle(grid), 'gap');
    const halfSpace = (space - gridGap) / 2;

    // TODO: name grid.children
    setSectionHeight(grid.children[0] as HTMLElement, space);
    setSectionHeight(grid.children[1] as HTMLElement, halfSpace);
    setSectionHeight(grid.children[2] as HTMLElement, halfSpace);
}

globalThis.addEventListener('resize', (_event) => {
    // TODO: https://bencentra.com/code/2015/02/27/optimizing-window-resize.html
    resize();
});
resize();
