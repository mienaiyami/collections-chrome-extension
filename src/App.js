import React, { useEffect, useState } from "react";
import Collections from "./components/Collections";
import CollectionView from "./components/CollectionView";

const isDev = process.env.NODE_ENV === "development";

const App = () => {
    const [data, dataUpdater] = useState([]);
    const [theme, themeUpdater] = useState("dark");
    /* eslint-disable */
    useEffect(() => {
        if (isDev) {
            import("./testdata").then((e) => {
                dataUpdater(e.default);
            });
        } else {
            chrome.storage.local.get("collections", ({ collections }) => {
                if (collections === undefined) {
                    dataUpdater([]);
                    chrome.storage.local.set({ collections: [] }, () => {});
                } else dataUpdater(collections);
            });
            chrome.storage.local.get("theme", ({ theme }) => {
                if (theme === undefined) {
                    themeUpdater("dark");
                    chrome.storage.local.set({ theme: "dark" }, () => {});
                } else themeUpdater(theme);
            });
        }
        document.getElementById("app").oncontextmenu = (e) => {
            e.preventDefault();
        };
    }, []);
    /* eslint-enable */
    const [currentCollection, currentCollectionUpdater] = useState(null);
    const [newColMaking, newColMakingUpdater] = useState(false);

    const initNewCollection1 = () => {
        newColMakingUpdater(true);
    };
    const addToCollections = ({ name, content }) => {
        // let occ = 0;
        // let name1 = name;
        // while (data.map((e) => e.name).includes(name1)) {
        //     occ++;
        //     name1 = name + "_" + occ;
        //     if (occ > 100) break;
        // }
        // if (occ > 100) return;
        const newData = {
            name: name,
            content,
        };
        const updatedData = [newData, ...data];
        dataUpdater(updatedData);
    };
    useEffect(() => {
        if (!isDev) {
            /* eslint-disable */
            chrome.storage.local.set({ collections: data });
            /* eslint-enable */
        }
    }, [data]);
    useEffect(() => {
        if (theme === "dark") {
            document.body.classList.remove("lightTheme");
            document.body.classList.add("darkTheme");
        }
        if (theme === "light") {
            document.body.classList.remove("darkTheme");
            document.body.classList.add("lightTheme");
        }
        if (!isDev) {
            /* eslint-disable */
            chrome.storage.local.set({ theme });
            /* eslint-enable */
        }
    }, [theme]);
    const addLinkToCollection = ({ colIndex, link, title, cover }) => {
        let newContentItem = {
            type: "link",
            title: title || "title",
            cover: cover || "",
            href: link,
        };
        data[colIndex].content.push(newContentItem);
        dataUpdater([...data]);
    };
    const removeCollections = (indexes) => {
        if (data.length < Math.max(...indexes)) return;
        let newData = [...data].filter((e, i) => {
            return !indexes.includes(i);
        });
        dataUpdater(newData);
    };
    const removeLinkFromCollection = (colIndex, indexes) => {
        if (data.length < colIndex) return;
        if (data[colIndex].content.length < Math.max(...indexes)) return;
        let newData = [...data];
        newData[colIndex].content = newData[colIndex].content.filter((e, i) => {
            return !indexes.includes(i);
        });
        dataUpdater(newData);
    };
    const changeCollectionIndex = (index1, index2) => {
        let newData = [...data];
        newData.splice(index1, 1);
        newData.splice(index2, 0, data[index1]);
        dataUpdater(newData);
    };
    const changeLinkIndex = (colIndex, index1, index2) => {
        let newData = [...data[colIndex].content];
        newData.splice(index1, 1);
        newData.splice(index2, 0, data[colIndex].content[index1]);
        data[colIndex].content = newData;
        dataUpdater([...data]);
    };
    const initNewCollection2 = () => {
        let content = [];
        //eslint-disable-next-line
        chrome.tabs.query({ currentWindow: true }).then((tabs) => {
            tabs.forEach((e) => {
                content.push({
                    type: "link",
                    href: e.url,
                    title: e.title,
                    cover: e.favIconUrl,
                });
            });
            data.unshift({
                name: new Date().toString().split(" (")[0],
                cover: "",
                content,
            });
            dataUpdater([...data]);
        });
    };
    const editCollection = (e) => {
        if (e.type === "rename") {
            data[e.index].name = e.name;
            dataUpdater([...data]);
        }
    };
    return (
        <>
            {newColMaking === true ? (
                <CollectionView
                    isNew={true}
                    newColMakingUpdater={newColMakingUpdater}
                    collection={null}
                    currentCollection={currentCollection}
                    newCollection1={initNewCollection1}
                    newCollection2={initNewCollection2}
                    editCollection={editCollection}
                    currentCollectionUpdater={currentCollectionUpdater}
                    addToCollections={addToCollections}
                    addLinkToCollection={addLinkToCollection}
                    removeLinkFromCollection={removeLinkFromCollection}
                    theme={theme}
                    themeUpdater={themeUpdater}
                />
            ) : currentCollection === null ? (
                <Collections
                    collectionData={data}
                    newCollection1={initNewCollection1}
                    newCollection2={initNewCollection2}
                    currentCollectionUpdater={currentCollectionUpdater}
                    addLinkToCollection={addLinkToCollection}
                    removeCollections={removeCollections}
                    theme={theme}
                    changeCollectionIndex={changeCollectionIndex}
                    themeUpdater={themeUpdater}
                />
            ) : (
                <CollectionView
                    isNew={false}
                    newColMakingUpdater={newColMakingUpdater}
                    collection={data[currentCollection]}
                    currentCollection={currentCollection}
                    newCollection1={initNewCollection1}
                    newCollection2={initNewCollection2}
                    editCollection={editCollection}
                    currentCollectionUpdater={currentCollectionUpdater}
                    addLinkToCollection={addLinkToCollection}
                    removeLinkFromCollection={removeLinkFromCollection}
                    theme={theme}
                    themeUpdater={themeUpdater}
                    changeLinkIndex={changeLinkIndex}
                />
            )}
        </>
    );
};

export default App;
