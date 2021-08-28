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
}) => {
    const goBack = () => {
        currentCollectionUpdater(null);
        if (isNew) newColMakingUpdater(false);
    };
    const mainContRef = useRef(null);
    const collectionViewRef = useRef(null);
    const contextMenu = useRef(null);
    const [contextMenuState, contextMenuStateUpdater] = useState("closed");
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
            console.log(x, y);
            console.log(contextMenu.current.offsetWidth);
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
        console.log("aaaa", selectedLink);
        if (selectedLink.length > 0) {
        }
    }, [selectedLink]);
    const deSelectAll = () => {
        selectedLinkUpdater([]);
        [...collectionViewRef.current?.children].forEach((e) => {
            e.lastElementChild.firstElementChild.firstElementChild.checked = false;
            e.lastElementChild.firstElementChild.firstElementChild.dispatchEvent(
                new Event("change")
            );
        });
    };
    const addLink = (e) => {
        console.log("fffff");
        //eslint-disable-next-line
        chrome.tabs
            .query({
                active: true,
                currentWindow: true,
            })
            .then((tabs) => {
                const tab = tabs[0];
                addLinkToCollection({
                    colIndex: currentCollection,
                    link: tab.url,
                    title: tab.title,
                    cover: tab.favIconUrl,
                });
            });
    };
    let content;
    console.log(isNew);
    content = (
        <>
            <TopBar
                main={false}
                name={collection === null ? null : collection.name}
                goBack={goBack}
                isNewCollection={isNew}
                addToCollections={addToCollections}
                newColMakingUpdater={newColMakingUpdater}
                editCollection={editCollection}
                currentCollection={currentCollection}
            />
            <div id="main" ref={mainContRef}>
                <div
                    className="contextMenu"
                    ref={contextMenu}
                    data-state={contextMenuState}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                >
                    <li role="button">Remove Link</li>
                    <li role="button">Open</li>
                    <li role="button">Open in new window</li>
                    <li role="button">Open in incognito window</li>
                </div>
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
                                removeLinkFromCollection(
                                    currentCollection,
                                    selectedLink
                                );
                                selectedLinkUpdater([]);
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
                    <button className="addCurrentLink" onClick={addLink}>
                        Add Current Link
                    </button>
                    <button className="customLink">New Link</button>
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
                                cover={e.cover}
                                title={e.title}
                                href={e.href}
                                key={e.href + i}
                                indexNumber={i}
                                currentCollection={currentCollection}
                                removeLinkFromCollection={
                                    removeLinkFromCollection
                                }
                                linkContextMenu={linkContextMenu}
                                addToSelected={addToSelected}
                                removeFromSelected={removeFromSelected}
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
