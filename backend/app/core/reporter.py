class Reporter:
    def __init__(self):
        self.report_data = []

    def add_record(self, record):
        self.report_data.append(record)

    def generate(self, format: str = "csv"):
        # TODO: serialize report data to CSV or Excel formats
        return {"format": format, "rows": len(self.report_data)}
