/**
 * Item size enumeration
 * Represents the physical size of an item
 * Based on actual values found in item data files
 */
export var Size;
(function (Size) {
    Size["TINY"] = "TINY";
    Size["SMALL"] = "SMALL";
    Size["MEDIUM"] = "MEDIUM";
    Size["LARGE"] = "LARGE";
    Size["HUGE"] = "HUGE";
})(Size || (Size = {}));
/**
 * Item type enumeration
 * Categorizes items by their primary function
 * Based on actual values found in item data files
 */
export var ItemType;
(function (ItemType) {
    ItemType["TOOL"] = "TOOL";
    ItemType["WEAPON"] = "WEAPON";
    ItemType["CONTAINER"] = "CONTAINER";
    ItemType["TREASURE"] = "TREASURE";
})(ItemType || (ItemType = {}));
