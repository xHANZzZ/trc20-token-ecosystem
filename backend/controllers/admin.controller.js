import * as adminService from '../services/admin.service.js';

export const getCompliance = async (req, res, next) => {
  try {
    const data = await adminService.checkComplianceStatus();
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const setCompliance = async (req, res, next) => {
  try {
    const { required } = req.validated.body;
    const data = await adminService.toggleComplianceStatus(required);
    res.status(200).json({
      status: 'success',
      message: 'Compliance requirement state updated',
      data
    });
  } catch (error) {
    next(error);
  }
};
