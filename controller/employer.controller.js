// employer controller
import mongoose from "mongoose";
import CompanyProfile from "../models/companyProfile.model.js";
import { JWT_SECRET } from "../config/env.js";


const employerController = {};

/****
 * employercontroller handles employer-specific operations
 * @param
 * 
 */
employerController.createCompanyProfile = async (req, res, next) => {
    try {
         const q = req?.body;

         const data = {
            
         }
        
    } catch (error) {
        console.error("Error in employerController.createCompanyProfile:", error);
        next(error); // Pass to global error middleware
    }
}



