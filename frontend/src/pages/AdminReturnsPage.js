import React from "react";

export default function AdminReturnsPage() {
  return (
    <div className="container mt-4">
      <div className="alert alert-info mb-0">
        If you want to return an item, please contact the shop directly.
      </div>
    </div>
  );
}

                    {r.status === "REFUNDED" && (
                      <div className="alert alert-success mb-0 small">
                        ✅ Refund completed on {new Date(r.refundProcessedAt).toLocaleDateString()}
                      </div>
                    )}

                    {r.status === "REJECTED" && (
                      <div className="alert alert-danger mb-0 small">
                        ❌ Request rejected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
