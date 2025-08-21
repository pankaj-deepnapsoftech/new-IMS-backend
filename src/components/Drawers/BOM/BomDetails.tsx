//@ts-nocheck
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { BiX } from "react-icons/bi";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";
import Drawer from "../../../ui/Drawer";

interface BomDetailsProps {
  bomId: string | undefined;
  closeDrawerHandler: () => void;
}

const BomDetails: React.FC<BomDetailsProps> = ({
  bomId,
  closeDrawerHandler,
}) => {
  const [cookies] = useCookies();
  const [isLoadingBom, setIsLoadingBom] = useState<boolean>(false);
  const [rawMaterials, setRawMaterials] = useState<any[] | []>([]);
  const [scrapMaterials, setScrapMaterials] = useState<any[] | []>([]);
  const [finishedGood, setFinishedGood] = useState<any | undefined>();
  const [processes, setProcesses] = useState<any[] | undefined>();
  const [bomName, setBomName] = useState<string | undefined>();
  const [partsCount, setPartsCount] = useState<number | undefined>();
  const [totalBomCost, setTotalBomCost] = useState<number | undefined>();
  const [otherCharges, setOtherCharges] = useState<any>();
  const [remarks, setRemarks] = useState<any[] | []>([]);
  const fetchBomDetails = async () => {
    if (!bomId) return;
    try {
      setIsLoadingBom(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/${bomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      console.log(data)
      setFinishedGood(data.bom.finished_good);
      setRawMaterials(data.bom.raw_materials);
      setBomName(data.bom.bom_name);
      setTotalBomCost(data.bom.total_cost);
      setPartsCount(data.bom.parts_count);
      setProcesses(data.bom.processes);
      setScrapMaterials(data.bom?.scrap_materials);
      setOtherCharges(data.bom?.other_charges);
      setRemarks(data?.bom?.remarks);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingBom(false);
    }
  };

  useEffect(() => {
    fetchBomDetails();
    // if bomId can change, add it to deps: [bomId]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Employee Details
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            color: colors.text.secondary,
            backgroundColor: colors.gray[100],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }}
        >
          <BiX size={20} />
        </button>
      </div>

      {isLoadingBom ? (
        <div className="flex justify-center py-10">
          <Loading />
        </div>
      ) : (
        <div className="space-y-8 m-3">
          {/* General Info */}
          <div className="bg-white p-6 shadow-lg rounded-lg border">
            <h3 className="text-xl font-semibold mb-4 text-teal-600">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-600">BOM Name</p>
                <p className="text-gray-800">{bomName ?? "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Parts Count</p>
                <p className="text-gray-800">{partsCount ?? 0}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Total Cost</p>
                <p className="text-gray-800 text-lg font-bold">
                  <p>
                    {cookies?.role === "admin"
                      ? `₹${totalBomCost?.toLocaleString() || 0}`
                      : "₹*****"}
                  </p>


                </p>
              </div>
            </div>
          </div>

          {/* Raw Materials */}
          {rawMaterials && rawMaterials.length > 0 && (
            <div className="bg-blue-50 p-6 shadow-lg rounded-lg border border-blue-300">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                Raw Materials
              </h3>
              <ul className="pl-5 list-disc space-y-4">
                {rawMaterials.map((material, index) => (
                  <li key={index} className="space-y-1">
                    <p>
                      <span className="font-semibold text-gray-600">
                        Item ID:
                      </span>{" "}
                      {material?.item?.product_id ?? "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Item Name:
                      </span>{" "}
                      {material?.item?.name ?? "N/A"}
                    </p>
                    {material?.item?.color ? (
                      <p>
                        <span className="font-semibold text-gray-600">
                          Item Color:
                        </span>{" "}
                        {material?.item?.color}
                      </p>
                    ) : null}
                    {material?.item?.code ? (
                      <p>
                        <span className="font-semibold text-gray-600">
                          Item Code:
                        </span>{" "}
                        {material?.item?.code}
                      </p>
                    ) : null}
                    <p>
                      <span className="font-semibold text-gray-600">
                        Quantity:
                      </span>{" "}
                      {material?.quantity}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        UOM:
                      </span>{" "}
                      {material?.item?.uom}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Total Part Cost:</span>{" "}
                      ₹ {cookies?.role === "admin"
                        ? material?.total_part_cost ?? 0
                        : "****"}/-
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Processes */}
          {processes && processes.length > 0 && (
            <div className="bg-green-50 p-6 shadow-lg rounded-lg border border-green-300">
              <h3 className="text-xl font-semibold mb-4 text-green-600">
                Processes
              </h3>
              <ul className="pl-5 list-disc space-y-2">
                {processes.map((process, index) => (
                  <li key={index} className="text-gray-800">
                    {process}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Finished Good */}
          {finishedGood && (
            <div className="bg-yellow-50 p-6 shadow-lg rounded-lg border border-yellow-300">
              <h3 className="text-xl font-semibold mb-4 text-yellow-600">
                Finished Good
              </h3>
              <ul className="pl-5 space-y-3">
                <li>
                  <span className="font-semibold text-gray-600">
                    Item ID:
                  </span>{" "}
                  {finishedGood?.item?.product_id ?? "N/A"}
                </li>
                <li>
                  <span className="font-semibold text-gray-600">
                    Item Name:
                  </span>{" "}
                  {finishedGood?.item?.name ?? "N/A"}
                </li>

                {finishedGood?.item?.color ? (
                  <li>
                    <span className="font-semibold text-gray-600">
                      Item Color:
                    </span>{" "}
                    {finishedGood?.item?.color}
                  </li>
                ) : null}
                {finishedGood?.item?.code ? (
                  <li>
                    <span className="font-semibold text-gray-600">
                      Item Code:
                    </span>{" "}
                    {finishedGood?.item?.code}
                  </li>
                ) : null}
                <li>
                  <span className="font-semibold text-gray-600">
                    Quantity:
                  </span>{" "}
                  {finishedGood.quantity}
                </li>
                <li>
                  <span className="font-semibold text-gray-600">UOM:</span>{" "}
                  {finishedGood?.item?.uom}
                </li>
                <li>
                  <span className="font-semibold text-gray-600">
                    Category:
                  </span>{" "}
                  {finishedGood?.item?.category}
                </li>
                <li>
                  <li>
                    <span className="font-semibold text-gray-600">Cost:</span>{" "}
                    ₹ {cookies?.role === "admin" ? finishedGood.cost ?? 0 : "****"}/-
                  </li>

                </li>
                <li>
                  <span className="font-semibold text-gray-600">
                    Supporting Document:
                  </span>{" "}
                  {finishedGood.supporting_doc ? (
                    <a
                      href={finishedGood.supporting_doc}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-teal-600"
                    >
                      Open
                    </a>
                  ) : (
                    "N/A"
                  )}
                </li>
              </ul>
            </div>
          )}

          {/* Scrap Materials */}
          {scrapMaterials && scrapMaterials.length > 0 && (
            <div className="bg-red-50 p-6 shadow-lg rounded-lg border border-red-300">
              <h3 className="text-xl font-semibold mb-4 text-red-600">
                Scrap Materials
              </h3>
              <ul className="pl-5 list-disc space-y-4">
                {scrapMaterials.map((material, index) => (
                  <li key={index} className="space-y-1">
                    <p>
                      <span className="font-semibold text-gray-600">
                        Item ID:
                      </span>{" "}
                      {material?.item?.product_id}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Item Name:
                      </span>{" "}
                      {material?.item?.name}
                    </p>
                    {material?.item?.color ? (
                      <p>
                        <span className="font-semibold text-gray-600">
                          Item Color:
                        </span>{" "}
                        {material?.item?.color}
                      </p>
                    ) : null}
                    {material?.item?.code ? (
                      <p>
                        <span className="font-semibold text-gray-600">
                          Item Code:
                        </span>{" "}
                        {material?.item?.code}
                      </p>
                    ) : null}
                    <p>
                      <span className="font-semibold text-gray-600">
                        Quantity:
                      </span>{" "}
                      {material?.quantity}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        UOM:
                      </span>{" "}
                      {material?.item?.uom}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Total Part Cost:</span>{" "}
                      ₹ {cookies?.role === "admin" ? material?.total_part_cost ?? 0 : "****"}/-
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Other Charges */}
          {otherCharges && (
            <div className="bg-purple-50 p-6 shadow-lg rounded-lg border border-purple-300">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">
                Other Charges
              </h3>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold text-gray-600">
                    Labour Charges:
                  </span>{" "}
                  ₹ {otherCharges?.labour_charges}/-
                </p>
                <p>
                  <span className="font-semibold text-gray-600">
                    Machinery Charges:
                  </span>{" "}
                  ₹ {otherCharges?.machinery_charges}/-
                </p>
                <p>
                  <span className="font-semibold text-gray-600">
                    Electricity Charges:
                  </span>{" "}
                  ₹ {otherCharges?.electricity_charges}/-
                </p>
                <p>
                  <span className="font-semibold text-gray-600">
                    Other Charges:
                  </span>{" "}
                  ₹ {otherCharges?.other_charges}/-
                </p>
              </div>
            </div>
          )}
          {remarks && (
            <div className="bg-cyan-50 p-6 shadow-lg rounded-lg border border-cyan-300">
              <h3 className="text-xl font-semibold mb-4 text-cyan-600">
                Remarks
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line capitalize">
                {remarks}
              </p>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default BomDetails;
