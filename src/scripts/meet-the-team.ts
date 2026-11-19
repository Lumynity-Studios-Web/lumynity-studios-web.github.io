const header = document.getElementById('meet-header') as HTMLHeadingElement;
const grid = document.getElementById(
    'members-collection',
) as HTMLDivElement;
const memberGroups = document.getElementsByClassName(
    'member-group',
) as HTMLCollectionOf<HTMLDivElement>;
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

function setSectionHeight(
    section: HTMLElement,
    gridSizes: { [area: string]: number },
) {
    const gridArea = section.style.gridArea;
    const height = gridSizes[gridArea];

    const headingHeight = getElementFullHeight(
        section.querySelector(':scope > .team-type-header'),
    );

    const group = section.querySelector(':scope > .member-group');
    group.setAttribute('data-height', (height - headingHeight).toString());
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
        grid.classList.remove('fixed-layout');
        return;
    }

    const gridGap = getFloatProperty(globalThis.getComputedStyle(grid), 'gap');
    const halfSpace = (space - gridGap) / 2;

    const gridSizes = {
        modders: space,
        webdevs: halfSpace,
        contributors: halfSpace,
    };
    for (const section of grid.children) {
        setSectionHeight(section as HTMLElement, gridSizes);
    }

    grid.classList.add('fixed-layout');
}

globalThis.addEventListener('resize', (_event) => {
    // TODO: https://bencentra.com/code/2015/02/27/optimizing-window-resize.html
    resize();
});
resize();

function setGroupGradient(group: HTMLDivElement) {
    const scrollMax = group.scrollHeight - group.clientHeight;
    const scroll = group.scrollTop;

    group.setAttribute('data-gradient-top', Math.min(scroll, 50).toString());
    group.setAttribute(
        'data-gradient-bottom',
        Math.min(scrollMax - scroll, 50).toString(),
    );
}

for (const tab of memberGroups) {
    setGroupGradient(tab);
    tab.addEventListener(
        'scroll',
        (event) => setGroupGradient(event.target as HTMLDivElement),
    );
}
