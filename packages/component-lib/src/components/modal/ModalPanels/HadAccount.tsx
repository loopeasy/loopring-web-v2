import { AccountBaseProps } from "./Interface";
import { AccountBasePanel } from "./AccountBase";
import { Box } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { DepositRecorder } from "./DepositRecorder";
import { AccountHashInfo } from "@loopring-web/common-resources";
import { Button } from "../../basic-lib";

export const HadAccount = withTranslation("common")(
  ({
    mainBtn,
    className,
    onClose,
    t,
    ...props
  }: WithTranslation &
    AccountBaseProps & {
      onClose: (e?: any) => void;
      className?: string;
      clearDepositHash: () => void;
      chainInfos: AccountHashInfo;
    }) => {
    return (
      <Box
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        alignItems={"center"}
        className={className}
      >
        <Box
          display={"flex"}
          flex={1}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <AccountBasePanel {...props} t={t} />
        </Box>
        <>
          {/guardian/gi.test(className ?? "") ? (
            <Box
              display={"flex"}
              marginTop={2}
              alignSelf={"stretch"}
              paddingX={5}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Button
                variant={"contained"}
                fullWidth
                size={"medium"}
                onClick={onClose}
              >
                {t("labelClose")}
              </Button>
            </Box>
          ) : (
            <>
              <Box
                display={"flex"}
                marginTop={2}
                alignSelf={"stretch"}
                paddingX={5}
                flexDirection={"column"}
                alignItems={"center"}
              >
                {mainBtn as any}
              </Box>
              <Box
                display={"flex"}
                marginX={0}
                marginTop={3}
                marginBottom={0}
                alignSelf={"stretch"}
                paddingX={5}
                padding={0}
              >
                <DepositRecorder
                  {...props}
                  clear={props.clearDepositHash}
                  t={t}
                />
              </Box>
            </>
          )}
        </>
      </Box>
    );
  }
);
