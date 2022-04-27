import styled from "@emotion/styled";
import { Box, FormLabel, Grid, Typography } from "@mui/material";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IpfsFile,
  IPFSSourceUpload,
  MintNFTBlock,
  FeeToggle,
  NFTMintProps,
  NFTMetaProps,
  NFTMetaBlockProps,
  TextareaAutosizeStyled,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  EmptyValueTag,
  FeeInfo,
  MintTradeNFT,
  NFTMETA,
  TransErrorHelp,
} from "@loopring-web/common-resources";
import { NFT_MINT_VALUE } from "stores/router";
import * as sdk from "@loopring-web/loopring-sdk";
const MaxSize = 8000000;
const StyleWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const TYPES = ["jpeg", "jpg", "gif", "png"];
export const MetaNFTPanel = <
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  I,
  C extends FeeInfo
>({
  nftMetaProps,
  nftMintProps,
  handleFeeChange,
  isFeeNotEnough,
  ipfsMediaSources,
  onFilesLoad,
  onDelete,
  nftMintValue,
  errorOnMeta,
  chargeFeeTokenList,
  feeInfo,
}: Partial<NFTMetaBlockProps<Me, Mi, C>> & {
  feeInfo: C;
  errorOnMeta: undefined | sdk.RESULT_INFO;
  nftMintValue: NFT_MINT_VALUE<I>;
  nftMintProps: NFTMintProps<Me, Mi, C>;
  nftMetaProps: NFTMetaProps<Me, C>;
  onFilesLoad: (value: IpfsFile) => void;
  onDelete: () => void;
  ipfsMediaSources: IpfsFile | undefined;
}) => {
  const { t } = useTranslation("common");
  const [dropdownErrorStatus, setDropdownErrorStatus] =
    React.useState<"up" | "down">("down");
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };

  return (
    <StyleWrapper
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      marginBottom={2}
    >
      <Grid
        container
        spacing={5 / 2}
        paddingX={5 / 2}
        paddingTop={5 / 2}
        flex={1}
      >
        <Grid item xs={12} md={5} position={"relative"}>
          <FormLabel>
            <Typography variant={"body2"} marginBottom={1}>
              <Trans i18nKey={"labelIPFSUploadTitle"}>
                Upload Image
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"error"}
                >
                  {"\uFE61"}
                </Typography>
              </Trans>
            </Typography>
          </FormLabel>

          <IPFSSourceUpload
            fullSize={true}
            value={ipfsMediaSources}
            maxSize={MaxSize}
            types={TYPES}
            onChange={onFilesLoad}
            onDelete={onDelete}
          />

          <Box marginTop={1}>
            {!chargeFeeTokenList?.length ? (
              <Typography>{t("labelFeeCalculating")}</Typography>
            ) : (
              <>
                <Typography
                  component={"span"}
                  display={"flex"}
                  flexWrap={"wrap"}
                  alignItems={"center"}
                  variant={"body2"}
                  color={"var(--color-text-secondary)"}
                  marginBottom={1}
                >
                  <FormLabel>
                    <Typography variant={"body2"} lineHeight={"20px"}>
                      <Trans i18nKey={"labelMINTNFTFee"}>
                        Fee
                        <Typography
                          component={"span"}
                          variant={"inherit"}
                          color={"error"}
                        >
                          {"\uFE61"}
                        </Typography>
                      </Trans>
                    </Typography>
                  </FormLabel>
                  <Box
                    component={"span"}
                    display={"flex"}
                    alignItems={"center"}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setDropdownStatus((prev) =>
                        prev === "up" ? "down" : "up"
                      )
                    }
                  >
                    {feeInfo && feeInfo.belong && feeInfo.fee
                      ? feeInfo.fee + " " + feeInfo.belong
                      : EmptyValueTag + " " + feeInfo?.belong}
                    <DropdownIconStyled
                      status={dropdownStatus}
                      fontSize={"medium"}
                    />
                    <Typography
                      marginLeft={1}
                      component={"span"}
                      color={"var(--color-error)"}
                    >
                      {isFeeNotEnough && t("transferLabelFeeNotEnough")}
                    </Typography>
                  </Box>
                </Typography>
                {dropdownStatus === "up" && (
                  <FeeTokenItemWrapper padding={2}>
                    <Typography
                      variant={"body2"}
                      color={"var(--color-text-third)"}
                      marginBottom={1}
                    >
                      {t("transferLabelFeeChoose")}
                    </Typography>
                    <FeeToggle
                      chargeFeeTokenList={chargeFeeTokenList as C[]}
                      handleToggleChange={handleToggleChange}
                      feeInfo={feeInfo as C}
                    />
                  </FeeTokenItemWrapper>
                )}
              </>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={7} flex={1} display={"flex"}>
          <MintNFTBlock
            {...nftMetaProps}
            handleMintDataChange={nftMintProps.handleMintDataChange}
            // handleOnMetaChange={nftMetaProps.handleOnMetaChange}
            // onMetaClick={nftMetaProps.onMetaClick}
            nftMeta={nftMintValue.nftMETA as Me}
            mintData={nftMintValue.mintData as Mi}
            feeInfo={nftMintProps.feeInfo}
            handleFeeChange={nftMintProps.handleFeeChange}
          />
        </Grid>
        {errorOnMeta && (
          <Grid item xs={12} md={7} flex={1} display={"flex"}>
            <Typography
              marginX={3}
              whiteSpace={"pre-line"}
              variant={"body2"}
              color={"var(--color-text-third)"}
              component={"div"}
              marginBottom={2}
              alignSelf={"flex-center"}
              paddingX={1}
              marginY={1}
              textAlign={"center"}
            >
              <Typography
                variant={"inherit"}
                display={"inline-flex"}
                onClick={() =>
                  setDropdownErrorStatus((prev) =>
                    prev === "up" ? "down" : "up"
                  )
                }
              >
                {`${t("labelErrorTitle")}`}
                <TransErrorHelp error={errorOnMeta} />
                <DropdownIconStyled
                  status={dropdownErrorStatus}
                  fontSize={"medium"}
                />
              </Typography>

              {dropdownErrorStatus === "up" && (
                <TextareaAutosizeStyled
                  aria-label="NFT Description"
                  minRows={5}
                  disabled={true}
                  value={`${JSON.stringify(errorOnMeta)}}`}
                />
              )}

              {/*{\`Error Description:\\n {code: ${error?.code}, message:${error?.message}}\`}*/}
            </Typography>
          </Grid>
        )}
      </Grid>
    </StyleWrapper>
  );
};
