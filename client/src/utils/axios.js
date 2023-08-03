import axios from "axios";
import { baseUrl } from "./API";


const instance= axios.create({
    baseURL:baseUrl,
    
})

export default instance