// externals
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

// actions
import { setLocale } from "./store/app/actions";

// components
import { App } from "./App";

const mapDispatchToProps = {
    setLocale
};

export default connect(
    null,
    mapDispatchToProps
)(withTranslation()<any>(App));
