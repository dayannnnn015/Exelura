import axios from "axios";
import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    PRODUCTS_ENDPOINT
} from "../configs/constants";

const SeachProducts = async ({
    searchKey,
    page = DEFAULT_PAGE,
    perPage = DEFAULT_PER_PAGE
}: {
    searchKey: string,
    page: number,
    perPage: number
}) => {
    const paginationParams = `&limit=${perPage}&skip=${(page - 1) * perPage}`;
    const response = await axios.get(`${PRODUCTS_ENDPOINT}/search?q=${searchKey}${paginationParams}`);
    const { products, skip, total } = response.data;

    return { products, perPage, total, page: skip / perPage + 1, lastPage: Math.ceil(total / perPage) };
}

export { SeachProducts };