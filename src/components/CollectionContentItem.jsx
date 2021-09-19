import React, { useEffect, useRef, useState } from "react";
import CheckBox from "./CheckBox";
const CollectionContentItem = ({
    title,
    href,
    displayImg,
    removeLinkFromCollection,
    currentCollection,
    linkContextMenu,
    addToSelected,
    removeFromSelected,
    indexNumber,
    filterMeta,
    onLinkDrag,
    openLink,
}) => {
    const checkboxRef = useRef(null);
    const [checkboxState, checkboxStateUpdater] = useState(false);
    const [cover, coverUpdater] = useState("");
    const fetchImg = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            res.text().then((data) => {
                filterMeta(data).then((imgUrl) => {
                    if (imgUrl === "") imgUrl = displayImg;
                    coverUpdater(imgUrl);
                });
            });
        }
        if (res.status === 429) {
            setTimeout(() => {
                fetchImg(url);
            }, 1000);
        }
    };
    useEffect(() => {
        checkboxRef.current.addEventListener("change", (e) => {
            let state = e.target.checked;
            checkboxStateUpdater(state);
        });
        if (href.startsWith("http")) fetchImg(href);
    }, []);
    useEffect(() => {
        if (checkboxState === true) addToSelected(indexNumber);
        if (checkboxState === false) removeFromSelected(indexNumber);
    }, [checkboxState]);

    return (
        <div
            className="collectionContentItem collectionItem"
            tabIndex="0"
            data-index={indexNumber}
            data-checked={checkboxState}
            onClick={(e) => {
                e.preventDefault();
                if (e.ctrlKey) return openLink("newTab", href);
                openLink("sameTab", href);
            }}
            onMouseDown={(e) => {
                if (e.button === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
            onMouseUp={(e) => {
                if (e.button === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    openLink("newTab", href);
                }
            }}
            onContextMenu={(e) => {
                linkContextMenu(e, indexNumber);
            }}
            draggable
            onDragStart={(e) => {
                e.preventDefault();
                onLinkDrag(e, indexNumber);
            }}
        >
            <div className="cover">
                <img src={cover || ""} alt="Img" />
            </div>
            <div className="info">
                <span className="name" title={title}>
                    {title || "ddddd"}
                </span>
                <span className="link" title={href}>
                    {href || ""}
                </span>
            </div>
            <div className="options">
                <CheckBox ref={checkboxRef} />
            </div>
        </div>
    );
};

export default CollectionContentItem;
