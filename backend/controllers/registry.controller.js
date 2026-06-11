import * as registryService from '../services/registry.service.js';

export const register = async (req, res, next) => {
  try {
    const { wallet, kycLevel, metadataURI } = req.validated.body;
    const data = await registryService.registerWallet(wallet, kycLevel, metadataURI);
    res.status(201).json({
      status: 'success',
      message: 'Wallet profile created in registry',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const batchRegister = async (req, res, next) => {
  try {
    const { wallets, kycLevels, metadataURIs } = req.validated.body;
    const data = await registryService.batchRegisterWallets(wallets, kycLevels, metadataURIs);
    res.status(201).json({
      status: 'success',
      message: 'Batch wallet profiles registered successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { address } = req.validated.params;
    const data = await registryService.getProfile(address);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const updateKYC = async (req, res, next) => {
  try {
    const { wallet, newKycLevel } = req.validated.body;
    const data = await registryService.updateWalletKYC(wallet, newKycLevel);
    res.status(200).json({
      status: 'success',
      message: 'Wallet KYC tier updated',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const updateMetadata = async (req, res, next) => {
  try {
    const { wallet, newMetadataURI } = req.validated.body;
    const data = await registryService.updateWalletMetadata(wallet, newMetadataURI);
    res.status(200).json({
      status: 'success',
      message: 'Wallet profile metadata updated',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const deregister = async (req, res, next) => {
  try {
    const { address } = req.validated.params;
    const data = await registryService.deregisterWallet(address);
    res.status(200).json({
      status: 'success',
      message: 'Wallet deregistered successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};
