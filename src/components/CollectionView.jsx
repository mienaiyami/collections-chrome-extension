import React, { useRef, useEffect, useState } from "react";
import CollectionContentItem from "./CollectionContentItem";
import TopBar from "./TopBar";

const CollectionView = ({
    collection,
    currentCollection,
    currentCollectionUpdater,
    isNew,
    newColMakingUpdater,
    newCollection1,
    newCollection2,
    addToCollections,
    editCollection,
    addLinkToCollection,
    removeLinkFromCollection,
    theme,
    themeUpdater,
    changeLinkIndex,
}) => {
    const goBack = () => {
        currentCollectionUpdater(null);
        if (isNew) newColMakingUpdater(false);
    };
    const mainContRef = useRef(null);
    const collectionViewRef = useRef(null);
    const contextMenu = useRef(null);
    const dragIndicatorRef = useRef(null);
    const [contextMenuState, contextMenuStateUpdater] = useState("closed");
    const [isDragging, isDraggingUpdater] = useState(false);
    const [draggingIndex, draggingIndexUpdater] = useState(null);
    const [draggingOverIndex, draggingOverIndexUpdater] = useState(null);
    const [canOpenCollection, canOpenCollectionUpdater] = useState(true);
    const [contextMenuSelectedIndex, contextMenuSelectedIndexUpdater] =
        useState(null);
    const linkContextMenu = (e, index) => {
        if (contextMenu.current !== null) {
            let x =
                e.clientX >
                mainContRef.current.offsetWidth -
                    contextMenu.current.offsetWidth
                    ? mainContRef.current.offsetWidth -
                      contextMenu.current.offsetWidth -
                      30
                    : e.clientX;
            let y =
                e.clientY >
                document.body.offsetHeight - contextMenu.current.offsetHeight
                    ? document.body.offsetHeight -
                      contextMenu.current.offsetHeight -
                      30
                    : e.clientY;
            contextMenuSelectedIndexUpdater(index);
            contextMenu.current.style.left = x + "px";
            contextMenu.current.style.top = y + "px";
        }
        contextMenuStateUpdater("opened");
    };
    const [selectedLink, selectedLinkUpdater] = useState([]);
    const addToSelected = (index) => {
        if (selectedLink.includes(index)) return;
        selectedLinkUpdater([...selectedLink, index]);
    };
    const removeFromSelected = (index) => {
        if (selectedLink.includes(index)) {
            selectedLinkUpdater([...selectedLink.filter((e) => e !== index)]);
        }
    };
    useEffect(() => {
        if (selectedLink.length > 0) {
        }
    }, [selectedLink]);
    useEffect(() => {
        document.addEventListener("mousedown", (e) => {
            if (
                contextMenu !== null &&
                e.target !== contextMenu.current &&
                !e.path.includes(contextMenu.current)
            ) {
                contextMenuStateUpdater("closed");
            }
        });
    }, []);
    const deSelectAll = () => {
        selectedLinkUpdater([]);
        [...collectionViewRef.current?.children].forEach((e) => {
            e.lastElementChild.firstElementChild.firstElementChild.checked = false;
            e.lastElementChild.firstElementChild.firstElementChild.dispatchEvent(
                new Event("change")
            );
        });
    };
    const parser = new DOMParser();
    const filterMeta = async (data) => {
        let head = "";
        let startPoint = data.search(/<head.*?<\/head>/gi);
        let endPoint = data.search(/<\/head>/);
        for (let i = startPoint; i < endPoint; i++) {
            head += data[i];
        }
        head += "</head>";
        const parsedHead = parser.parseFromString(head, "text/html");
        // const meta = parsedHead.head.getElementsByTagName("meta");
        const metaImgTag =
            parsedHead.querySelector("meta[property='og:image']") ||
            parsedHead.querySelector("meta[name='og:image']");
        let imgUrl = metaImgTag ? metaImgTag.getAttribute("content") : "";
        return imgUrl;
    };
    const openLink = (type, link) => {
        if (!isDragging && canOpenCollection) {
            if (type === "sameTab") {
                /* eslint-disable */
                chrome.tabs.update({ url: link });
                /* eslint-enable */
            }
            if (type === "newTab") {
                /* eslint-disable */
                chrome.tabs.create({ url: link, active: false });
                /* eslint-enable */
            }
        }
    };
    const addLink = (which, e) => {
        if (which === "current") {
            //eslint-disable-next-line
            chrome.tabs
                .query({
                    active: true,
                    currentWindow: true,
                })
                .then((tabs) => {
                    const tab = tabs[0];
                    addLinkToCollection({
                        colIndex: isNew ? 0 : currentCollection,
                        link: tab.url,
                        title: tab.title,
                        cover: tab.favIconUrl,
                    });
                });
        }
        if (which === "all") {
            //eslint-disable-next-line
            chrome.tabs
                .query({
                    currentWindow: true,
                })
                .then((tabs) => {
                    for (let i = tabs.length - 1; i >= 0; i--) {
                        addLinkToCollection({
                            colIndex: currentCollection,
                            link: tabs[i].url,
                            title: tabs[i].title,
                            cover: tabs[i].favIconUrl,
                        });
                    }
                });
        }
    };
    const linkDrag = (e, index) => {
        isDraggingUpdater(true);
        draggingIndexUpdater(index);
        dragIndicatorRef.current.style.display = "flex";
        const nameElem = dragIndicatorRef.current.querySelector(".name");
        nameElem.innerHTML = collection.content[index].title;
        if (
            e.pageX - mainContRef.current.offsetLeft >=
            mainContRef.current.offsetWidth - nameElem.offsetWidth - 20
        ) {
            nameElem.style.left =
                mainContRef.current.offsetWidth -
                nameElem.offsetWidth -
                20 +
                "px";
        } else {
            nameElem.style.left =
                e.pageX - mainContRef.current.offsetLeft + 20 + "px";
        }
        nameElem.style.top =
            e.pageY -
            mainContRef.current.offsetTop +
            mainContRef.current.scrollTop +
            -40 +
            "px";
        const lineElem = dragIndicatorRef.current.querySelector(".line");
        lineElem.style.top =
            collectionViewRef.current.offsetTop +
            collectionViewRef.current.children[index].offsetTop -
            5 +
            "px";
    };
    const getLinkItem = (elem) => {
        let parent = elem.parentElement;
        if (
            !parent.classList.contains("collectionItem") &&
            !["collectionView ", "main", "app"].includes(parent.id) &&
            parent !== document.body
        ) {
            parent = getLinkItem(parent);
        }
        return parent;
    };
    const linkDragging = (e) => {
        const nameElem = dragIndicatorRef.current.querySelector(".name");
        if (
            e.pageX - mainContRef.current.offsetLeft >=
            mainContRef.current.offsetWidth - nameElem.offsetWidth - 40
        ) {
            nameElem.style.left =
                mainContRef.current.offsetWidth -
                nameElem.offsetWidth -
                20 +
                "px";
        } else {
            nameElem.style.left =
                e.pageX - mainContRef.current.offsetLeft + 20 + "px";
        }
        nameElem.style.top =
            e.pageY -
            mainContRef.current.offsetTop +
            mainContRef.current.scrollTop +
            -40 +
            "px";
        const lineElem = dragIndicatorRef.current.querySelector(".line");
        const elemUnderMouse = document.elementFromPoint(e.pageX, e.pageY);
        let index = draggingOverIndex;
        if (
            !elemUnderMouse?.classList?.contains("collectionItem") &&
            elemUnderMouse !== collectionViewRef.current &&
            elemUnderMouse !== dragIndicatorRef.current &&
            elemUnderMouse !== nameElem &&
            elemUnderMouse !== lineElem
        ) {
            index = parseInt(
                getLinkItem(elemUnderMouse).getAttribute("data-index")
            );
        }
        if (elemUnderMouse?.classList?.contains("collectionItem"))
            index = parseInt(elemUnderMouse.getAttribute("data-index"));
        if (index !== null && !isNaN(index)) {
            draggingOverIndexUpdater(parseInt(index));
            lineElem.style.top =
                collectionViewRef.current.children[index].offsetTop +
                collectionViewRef.current.offsetTop -
                5 +
                "px";
        }
    };
    const linkDragEnd = (e) => {
        dragIndicatorRef.current.style.display = "none";
        const nameElem = dragIndicatorRef.current.querySelector(".name");
        nameElem.innerHTML = "";
        if (draggingIndex !== draggingOverIndex)
            changeLinkIndex(
                currentCollection,
                draggingIndex,
                draggingOverIndex
            );
        isDraggingUpdater(false);
        draggingIndexUpdater(null);
        draggingOverIndexUpdater(null);
        canOpenCollectionUpdater(false);
        setTimeout(() => {
            canOpenCollectionUpdater(true);
        }, 500);
    };
    let content;
    content = (
        <>
            <TopBar
                main={false}
                name={collection === null ? null : collection.name}
                goBack={goBack}
                isNewCollection={isNew}
                addToCollections={addToCollections}
                newColMakingUpdater={newColMakingUpdater}
                currentCollectionUpdater={currentCollectionUpdater}
                editCollection={editCollection}
                currentCollection={currentCollection}
                theme={theme}
                themeUpdater={themeUpdater}
            />
            <div
                id="main"
                ref={mainContRef}
                onMouseMove={(e) => {
                    if (isDragging && draggingIndex !== null) {
                        linkDragging(e);
                    }
                }}
                onMouseUp={(e) => {
                    if (isDragging && draggingIndex !== null) {
                        linkDragEnd(e);
                    }
                }}
                onMouseLeave={(e) => {
                    if (isDragging && draggingIndex !== null) {
                        linkDragEnd(e);
                    }
                }}
            >
                <div className="dragIndicator" ref={dragIndicatorRef}>
                    <span className="name"></span>
                    <span className="line"></span>
                </div>
                <div
                    className="contextMenu"
                    ref={contextMenu}
                    data-state={contextMenuState}
                    onClick={() => {
                        contextMenuStateUpdater("closed");
                    }}
                >
                    <li
                        role="button"
                        onClick={() => {
                            removeLinkFromCollection(currentCollection, [
                                contextMenuSelectedIndex,
                            ]);
                        }}
                    >
                        Remove Link
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            if (contextMenuSelectedIndex !== null)
                                navigator.clipboard.writeText(
                                    collection.content[contextMenuSelectedIndex]
                                        .href
                                );
                        }}
                    >
                        Copy Link
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            /* eslint-disable */
                            if (contextMenuSelectedIndex !== null)
                                chrome.tabs.create({
                                    url: collection.content[
                                        contextMenuSelectedIndex
                                    ].href,
                                    active: false,
                                }); /* eslint-enable */
                        }}
                    >
                        Open
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            /* eslint-disable */
                            if (contextMenuSelectedIndex !== null)
                                chrome.windows.create({
                                    url: collection.content[
                                        contextMenuSelectedIndex
                                    ].href,
                                    state: "maximized",
                                }); /* eslint-enable */
                        }}
                    >
                        Open in new window
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            /* eslint-disable */
                            if (contextMenuSelectedIndex !== null)
                                chrome.windows.create({
                                    url: collection.content[
                                        contextMenuSelectedIndex
                                    ].href,
                                    state: "maximized",
                                    incognito: true,
                                }); /* eslint-enable */
                        }}
                    >
                        Open in incognito window
                    </li>
                </div>
                <div className="collectionOptions">
                    <div
                        className="deleteSelected"
                        style={
                            selectedLink.length === 0
                                ? { display: "none" }
                                : { display: "flex" }
                        }
                    >
                        <span className="selectedInfo">
                            {selectedLink.length} selected
                        </span>
                        <span className="options">
                            <button
                                onClick={() => {
                                    /* eslint-disable */
                                    let links = collection.content
                                        .filter((e, i) =>
                                            selectedLink.includes(i)
                                        )
                                        .map((e) => e.href);
                                    links.forEach((link) => {
                                        chrome.tabs.create({
                                            url: link,
                                            active: false,
                                        }); /* eslint-enable */
                                    });
                                }}
                            >
                                Open
                            </button>
                            <button
                                onClick={() => {
                                    /* eslint-disable */
                                    let links = collection.content
                                        .filter((e, i) =>
                                            selectedLink.includes(i)
                                        )
                                        .map((e) => e.href);
                                    chrome.windows.create({
                                        url: links,
                                        state: "maximized",
                                    }); /* eslint-enable */
                                }}
                            >
                                New Window
                            </button>
                            <button
                                onClick={() => {
                                    /* eslint-disable */
                                    let links = collection.content
                                        .filter((e, i) =>
                                            selectedLink.includes(i)
                                        )
                                        .map((e) => e.href);
                                    chrome.windows.create({
                                        url: links,
                                        state: "maximized",
                                        incognito: true,
                                    }); /* eslint-enable */
                                }}
                            >
                                Incognito
                            </button>
                            <button
                                onClick={() => {
                                    removeLinkFromCollection(
                                        currentCollection,
                                        selectedLink
                                    );
                                    deSelectAll();
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    width="24px"
                                    fill="#FFFFFF"
                                >
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                </svg>
                            </button>
                            <button onClick={deSelectAll}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    width="24px"
                                    fill="#FFFFFF"
                                >
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </span>
                    </div>
                    <div
                        className="createNew"
                        style={
                            selectedLink.length === 0
                                ? { display: "flex" }
                                : { display: "none" }
                        }
                    >
                        <button
                            className="addCurrentLink"
                            onClick={() => {
                                addLink("current");
                                setTimeout(() => {
                                    collectionViewRef.current.lastElementChild.scrollIntoView(
                                        {
                                            block: "end",
                                        }
                                    );
                                }, 100);
                            }}
                        >
                            Add Current Tab
                        </button>
                        <button
                            className="addCurrentLink"
                            onClick={() => {
                                addLink("all");
                                setTimeout(() => {
                                    collectionViewRef.current.lastElementChild.scrollIntoView();
                                }, 100);
                            }}
                        >
                            Add All opened Tabs
                        </button>
                    </div>
                </div>
                <div
                    id="collectionView "
                    className="collection-view"
                    ref={collectionViewRef}
                >
                    {collection === null ? (
                        <p>No Item</p>
                    ) : collection.content.length === 0 ? (
                        <p>No Item</p>
                    ) : (
                        collection.content.map((e, i) => (
                            <CollectionContentItem
                                title={e.title}
                                href={e.href}
                                displayImg={e.cover}
                                key={e.href + i}
                                indexNumber={i}
                                currentCollection={currentCollection}
                                removeLinkFromCollection={
                                    removeLinkFromCollection
                                }
                                linkContextMenu={linkContextMenu}
                                addToSelected={addToSelected}
                                removeFromSelected={removeFromSelected}
                                filterMeta={filterMeta}
                                onLinkDrag={linkDrag}
                                openLink={openLink}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
    return content;
};

export default CollectionView;
