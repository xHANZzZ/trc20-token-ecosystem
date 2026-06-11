import * as tokenService from '../services/token.service.js';

export const getDetails = async (req, res, next) => {
  try {
    const data = await tokenService.getTokenDetails();
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getBalance = async (req, res, next) => {
  try {
    const { address } = req.validated.params;
    const data = await tokenService.getBalance(address);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAllowance = async (req, res, next) => {
  try {
    const { owner, spender } = req.validated.query;
    const data = await tokenService.getAllowance(owner, spender);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const transfer = async (req, res, next) => {
  try {
    const { recipient, amount } = req.validated.body;
    const data = await tokenService.transfer(recipient, amount);
    res.status(200).json({
      status: 'success',
      message: 'Token transfer complete',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const { spender, amount } = req.validated.body;
    const data = await tokenService.approve(spender, amount);
    res.status(200).json({
      status: 'success',
      message: 'Token allowance approved',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const transferFrom = async (req, res, next) => {
  try {
    const { sender, recipient, amount } = req.validated.body;
    const data = await tokenService.transferFrom(sender, recipient, amount);
    res.status(200).json({
      status: 'success',
      message: 'Spender token transfer complete',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const mint = async (req, res, next) => {
  try {
    const { to, amount } = req.validated.body;
    const data = await tokenService.mint(to, amount);
    res.status(200).json({
      status: 'success',
      message: 'New tokens successfully minted',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const burn = async (req, res, next) => {
  try {
    const { amount } = req.validated.body;
    const data = await tokenService.burn(amount);
    res.status(200).json({
      status: 'success',
      message: 'Tokens burned from custodian balance',
      data
    });
  } catch (error) {
    next(error);
  }
};
