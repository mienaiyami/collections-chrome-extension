import React, { useRef, useEffect, useState } from "react";
import CollectionItem from "./CollectionItem";
import TopBar from "./TopBar";

const Collections = ({
    collectionData,
    removeCollections,
    changeCollectionIndex,
    currentCollectionUpdater,
    newCollection1,
    newCollection2,
    addLinkToCollection,
    theme,
    themeUpdater,
}) => {
    const mainContRef = useRef(null);
    const collectionRef = useRef(null);
    const contextMenu = useRef(null);
    const dragIndicatorRef = useRef(null);
    const [contextMenuState, contextMenuStateUpdater] = useState("closed");
    const [isDragging, isDraggingUpdater] = useState(false);
    const [draggingIndex, draggingIndexUpdater] = useState(null);
    const [draggingOverIndex, draggingOverIndexUpdater] = useState(null);
    const [canOpenCollection, canOpenCollectionUpdater] = useState(true);
    const [contextMenuSelectedIndex, contextMenuSelectedIndexUpdater] =
        useState(null);
    const collectionContextMenu = (e, index) => {
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
    const openCollection = (index) => {
        if (!isDragging && canOpenCollection) {
            currentCollectionUpdater(index);
        }
    };
    const [selectedCollection, selectedCollectionUpdater] = useState([]);
    const addToSelected = (index) => {
        if (selectedCollection.includes(index)) return;
        selectedCollectionUpdater([...selectedCollection, index]);
    };
    const removeFromSelected = (index) => {
        if (selectedCollection.includes(index)) {
            selectedCollectionUpdater([
                ...selectedCollection.filter((e) => e !== index),
            ]);
        }
    };
    useEffect(() => {
        if (selectedCollection.length > 0) {
        }
    }, [selectedCollection]);
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
        selectedCollectionUpdater([]);
        [...collectionRef.current?.children].forEach((e) => {
            e.lastElementChild.firstElementChild.firstElementChild.checked = false;
            e.lastElementChild.firstElementChild.firstElementChild.dispatchEvent(
                new Event("change")
            );
        });
    };
    const [PromptConfirm, PromptConfirmMaker] = useState("");
    const promptConfirm = (msg, callback) => {
        PromptConfirmMaker(
            <div className="promptConfirmCont">
                <div className="prompt">
                    <div className="msg">{msg}</div>
                    <div className="option">
                        <button
                            onClick={() => {
                                callback();
                                PromptConfirmMaker("");
                            }}
                            className="warn"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => {
                                PromptConfirmMaker("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const collectionDrag = (e, index) => {
        isDraggingUpdater(true);
        draggingIndexUpdater(index);
        dragIndicatorRef.current.style.display = "flex";
        const nameElem = dragIndicatorRef.current.querySelector(".name");
        nameElem.innerHTML = collectionData[index].name;
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
            collectionRef.current.offsetTop +
            collectionRef.current.children[index].offsetTop -
            5 +
            "px";
    };
    const getcollectionItem = (elem) => {
        let parent = elem.parentElement;
        if (
            !parent.classList.contains("collectionItem") &&
            !["collections", "main", "app"].includes(parent.id) &&
            parent !== document.body
        ) {
            parent = getcollectionItem(parent);
        }
        return parent;
    };
    const collectionDragging = (e) => {
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
            elemUnderMouse !== collectionRef.current &&
            elemUnderMouse !== dragIndicatorRef.current &&
            elemUnderMouse !== nameElem &&
            elemUnderMouse !== lineElem
        ) {
            index = parseInt(
                getcollectionItem(elemUnderMouse).getAttribute("data-index")
            );
        }
        if (elemUnderMouse?.classList?.contains("collectionItem"))
            index = parseInt(elemUnderMouse.getAttribute("data-index"));
        if (index !== null && !isNaN(index)) {
            draggingOverIndexUpdater(parseInt(index));
            lineElem.style.top =
                collectionRef.current.children[index].offsetTop +
                collectionRef.current.offsetTop -
                5 +
                "px";
        }
    };
    const collectionDragEnd = (e) => {
        dragIndicatorRef.current.style.display = "none";
        const nameElem = dragIndicatorRef.current.querySelector(".name");
        nameElem.innerHTML = "";
        if (draggingIndex !== draggingOverIndex)
            changeCollectionIndex(draggingIndex, draggingOverIndex);
        isDraggingUpdater(false);
        draggingIndexUpdater(null);
        draggingOverIndexUpdater(null);
        canOpenCollectionUpdater(false);
        setTimeout(() => {
            canOpenCollectionUpdater(true);
        }, 500);
    };
    const cancelDrag = () => {
        dragIndicatorRef.current.style.display = "none";
        const nameElem = dragIndicatorRef.current.querySelector(".name");
        nameElem.innerHTML = "";
        isDraggingUpdater(false);
        draggingIndexUpdater(null);
        draggingOverIndexUpdater(null);
    };
    return (
        <>
            <TopBar
                main={true}
                name="Collections"
                currentCollectionUpdater={currentCollectionUpdater}
                theme={theme}
                themeUpdater={themeUpdater}
            />
            <div id="main" ref={mainContRef}>
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
                            removeCollections([contextMenuSelectedIndex]);
                        }}
                    >
                        Remove Collection
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                JSON.stringify(
                                    collectionData[contextMenuSelectedIndex]
                                        .content
                                )
                            );
                        }}
                    >
                        Copy Links(JSON)
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            /* eslint-disable */
                            if (contextMenuSelectedIndex !== null) {
                                let links = collectionData[
                                    contextMenuSelectedIndex
                                ].content.map((e) => e.href);
                                links.forEach((link) => {
                                    chrome.tabs.create({
                                        url: link,
                                        active: false,
                                    }); /* eslint-enable */
                                });
                            }
                        }}
                    >
                        Open All
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            /* eslint-disable */
                            let links = collectionData[
                                contextMenuSelectedIndex
                            ].content.map((e) => e.href);
                            if (contextMenuSelectedIndex !== null)
                                chrome.windows.create({
                                    url: links,
                                    state: "maximized",
                                }); /* eslint-enable */
                        }}
                    >
                        Open All in new window
                    </li>
                    <li
                        role="button"
                        onClick={() => {
                            /* eslint-disable */
                            let links = collectionData[
                                contextMenuSelectedIndex
                            ].content.map((e) => e.href);
                            if (contextMenuSelectedIndex !== null)
                                chrome.windows.create({
                                    url: links,
                                    state: "maximized",
                                    incognito: true,
                                }); /* eslint-enable */
                        }}
                    >
                        Open All in incognito window
                    </li>
                </div>
                <div className="collectionOptions">
                    <div
                        className="deleteSelected"
                        style={
                            selectedCollection.length === 0
                                ? { display: "none" }
                                : { display: "flex" }
                        }
                    >
                        <span className="selectedInfo">
                            {selectedCollection.length} selected
                        </span>
                        <span className="options">
                            <button
                                onClick={() => {
                                    promptConfirm(
                                        "Are you sure you want to delete selected collections",
                                        () => {
                                            removeCollections(
                                                selectedCollection
                                            );
                                            deSelectAll();
                                        }
                                    );
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
                            selectedCollection.length === 0
                                ? { display: "flex" }
                                : { display: "none" }
                        }
                    >
                        <button className="newEmpty" onClick={newCollection1}>
                            Create New Collection
                        </button>
                        <button className="newFromAll" onClick={newCollection2}>
                            Create New Collection from All Opened tabs
                        </button>
                    </div>
                </div>
                <div
                    id="collections"
                    ref={collectionRef}
                    className="collection-view"
                    onMouseMove={(e) => {
                        if (isDragging && draggingIndex !== null) {
                            collectionDragging(e);
                        }
                    }}
                    onMouseUp={(e) => {
                        if (isDragging && draggingIndex !== null) {
                            collectionDragEnd(e);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (isDragging && draggingIndex !== null) {
                            collectionDragEnd(e);
                        }
                    }}
                >
                    {collectionData === null ? (
                        <p>No Collection</p>
                    ) : collectionData.length === 0 ? (
                        <p>No Collection</p>
                    ) : (
                        collectionData.map((e, i) => (
                            <CollectionItem
                                key={e.name + i}
                                name={e.name}
                                total={e.content.length}
                                indexNumber={i}
                                openCollection={openCollection}
                                removeCollections={removeCollections}
                                collectionContextMenu={collectionContextMenu}
                                addToSelected={addToSelected}
                                removeFromSelected={removeFromSelected}
                                addLinkToCollection={addLinkToCollection}
                                onCollectionDrag={collectionDrag}
                            />
                        ))
                    )}
                </div>
            </div>
            {PromptConfirm}
        </>
    );
};

export default Collections;
